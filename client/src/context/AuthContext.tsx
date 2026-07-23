import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useUiStore } from "@/store/uiStore";

interface AuthContextType {
  isCheckingSession: boolean;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const { addToast } = useUiStore();

  const checkSession = async () => {
    try {
      const result = await authService.refresh();
      if (result?.accessToken && result?.user) {
        setAuth(result.user, result.accessToken);
      } else if (isAuthenticated) {
        clearAuth();
        addToast({ type: "info", message: "Session expired. Please sign in again." });
      }
    } catch {
      if (isAuthenticated) {
        clearAuth();
        addToast({ type: "info", message: "Session expired. Please sign in again." });
      }
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isCheckingSession, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
