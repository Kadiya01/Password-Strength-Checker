import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  ClipboardCheck,
  Cpu,
  History,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Lock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";
import Footer from "./Footer";

export default function AppLayout() {
  const { user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, theme, toggleSidebar, toggleTheme, setTheme } = useUiStore();

  useEffect(() => {
    // Sync theme on initial render
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/password-checker", label: "Strength Checker", icon: ClipboardCheck },
    { path: "/password-generator", label: "Password Generator", icon: Cpu },
    { path: "/history", label: "History Log", icon: History },
    { path: "/profile", label: "User Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100 cyber-grid">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            <span className="hidden font-bold tracking-tight text-gray-900 dark:text-white sm:block md:text-xl">
              SentinelPass
            </span>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* User Widget */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-gray-800">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username || "Secure User"}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={() => logout.mutate()}
              title="Logout"
              className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Framework Layout */}
      <div className="flex">
        {/* Sidebar - Desktop Layout */}
        <aside
          className={`fixed bottom-0 top-16 left-0 z-30 hidden w-64 border-r border-gray-200/80 bg-white/70 backdrop-blur-md transition-all duration-300 dark:border-gray-800/80 dark:bg-gray-900/70 lg:block ${
            sidebarOpen ? "lg:w-64" : "lg:w-20"
          }`}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {sidebarOpen && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  NIST Compliant
                </div>
                <p className="mt-1 text-[10px] text-blue-600/80 dark:text-blue-400/80">
                  SentinelPass evaluates and suggests passwords conforming to NIST SP 800-63B standards.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Drawer Mobile Layout */}
        <AnimatePresence>
          {!sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!sidebarOpen && (
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 top-0 left-0 z-50 w-64 bg-white p-4 shadow-2xl dark:bg-gray-900 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white">SentinelPass</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={toggleSidebar}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Wrapper */}
        <div
          className={`flex min-h-[calc(100vh-4rem)] w-full flex-col transition-all duration-300 ${
            sidebarOpen ? "lg:pl-64" : "lg:pl-20"
          }`}
        >
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="mx-auto max-w-6xl"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </div>

      {/* Floating Bottom Navigation (Mobile Viewports Only) */}
      <div className="fixed bottom-0 right-0 left-0 z-30 flex h-16 items-center justify-around border-t border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90 lg:hidden">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center text-[10px] font-medium transition-all ${
            location.pathname === "/dashboard"
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/password-checker"
          className={`flex flex-col items-center justify-center text-[10px] font-medium transition-all ${
            location.pathname === "/password-checker"
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ClipboardCheck className="h-5 w-5" />
          <span>Checker</span>
        </Link>
        <Link
          to="/password-generator"
          className={`flex flex-col items-center justify-center text-[10px] font-medium transition-all ${
            location.pathname === "/password-generator"
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Cpu className="h-5 w-5" />
          <span>Generator</span>
        </Link>
        <Link
          to="/history"
          className={`flex flex-col items-center justify-center text-[10px] font-medium transition-all ${
            location.pathname === "/history"
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <History className="h-5 w-5" />
          <span>History</span>
        </Link>
      </div>
    </div>
  );
}
