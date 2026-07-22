import Spinner from "@/components/ui/Spinner";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = "md", fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={size} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Spinner size={size} />
    </div>
  );
}
