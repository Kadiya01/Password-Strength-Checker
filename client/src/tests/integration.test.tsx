import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import api from "../services/api";
import AuthGuard from "../router/AuthGuard";
import GuestGuard from "../router/GuestGuard";
import LoginPage from "../pages/Auth/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

// Mock services
vi.mock("../services/authService", () => ({
  authService: {
    refresh: vi.fn(),
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("../services/api", () => {
  return {
    default: {
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
    },
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("SentinelPass Integration & Authentication Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe("Authentication Flow & Context", () => {
    it("should silently refresh session on boot when refresh token cookie is present", async () => {
      const mockUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        role: "USER",
      };

      vi.mocked(authService.refresh).mockResolvedValue({
        accessToken: "mock-access-token",
        user: mockUser,
      });

      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div>Test Children</div>
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(authService.refresh).toHaveBeenCalled();
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user).toEqual(mockUser);
        expect(useAuthStore.getState().token).toBe("mock-access-token");
      });
    });

    it("should clear session if refresh handshake fails", async () => {
      vi.mocked(authService.refresh).mockRejectedValue(new Error("Refresh failed"));

      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div>Test Children</div>
          </AuthProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(authService.refresh).toHaveBeenCalled();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().user).toBeNull();
      });
    });
  });

  describe("Protected & Public Route Guarantees", () => {
    it("should redirect unauthenticated users visiting dashboard to login page", async () => {
      vi.mocked(authService.refresh).mockRejectedValue(new Error("No session"));

      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={["/dashboard"]}>
              <Routes>
                <Route element={<AuthGuard />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>
                <Route path="/login" element={<div>Redirected Login Screen</div>} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(await screen.findByText("Redirected Login Screen")).toBeInTheDocument();
    });

    it("should prevent authenticated users from visiting guest-only login page", async () => {
      const mockUser = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "test@example.com",
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        role: "USER",
      };

      // Set user as already logged in
      useAuthStore.getState().setAuth(mockUser, "valid-token");
      vi.mocked(authService.refresh).mockResolvedValue({ accessToken: "valid-token", user: mockUser });

      const queryClient = createTestQueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={["/login"]}>
              <Routes>
                <Route element={<GuestGuard />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/dashboard" element={<div>Redirected Dashboard Screen</div>} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(await screen.findByText("Redirected Dashboard Screen")).toBeInTheDocument();
    });
  });
});
