import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Menu, X, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">PWC</span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link to="/check" className="text-sm font-medium text-gray-600 hover:text-gray-900">Check Strength</Link>
            <Link to="/generate" className="text-sm font-medium text-gray-600 hover:text-gray-900">Generate</Link>
            <Link to="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900">History</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              {user?.username}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout.mutate();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Dashboard</Link>
            <Link to="/check" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Check Strength</Link>
            <Link to="/generate" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Generate</Link>
            <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">History</Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Profile</Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Settings</Link>
            <hr />
            <button onClick={() => { setMobileMenuOpen(false); logout.mutate(); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-gray-100">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
