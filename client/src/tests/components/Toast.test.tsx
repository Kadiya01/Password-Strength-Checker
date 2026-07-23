import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToastContainer from "@/components/ui/Toast";
import { useUiStore } from "@/store/uiStore";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, exit, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("ToastContainer", () => {
  beforeEach(() => {
    useUiStore.getState().removeToast = useUiStore.getState().removeToast;
    const toasts = useUiStore.getState().toasts;
    for (const t of toasts) {
      useUiStore.getState().removeToast(t.id);
    }
  });

  it("should render toast messages", () => {
    act(() => {
      useUiStore.getState().addToast({ type: "success", message: "Operation successful" });
    });

    render(<ToastContainer />);
    expect(screen.getByText("Operation successful")).toBeInTheDocument();
  });

  it("should close toast on button click", async () => {
    const user = userEvent.setup();
    act(() => {
      useUiStore.getState().addToast({ type: "error", message: "Error occurred" });
    });

    render(<ToastContainer />);
    const closeBtn = screen.getByRole("button", { name: /close notification/i });
    await user.click(closeBtn);

    expect(screen.queryByText("Error occurred")).not.toBeInTheDocument();
  });

  it("should render different toast types", () => {
    act(() => {
      useUiStore.getState().addToast({ type: "info", message: "Info message" });
      useUiStore.getState().addToast({ type: "warning", message: "Warning message" });
    });

    render(<ToastContainer />);
    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });
});
