import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useAuthContext } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const { isCheckingSession } = useAuthContext();

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
