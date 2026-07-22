import { lazy, Suspense } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "./AuthGuard";
import GuestGuard from "./GuestGuard";
import Skeleton from "@/components/ui/Skeleton";

// Lazy load pages for fast initial bundle speeds
const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/Auth/Login/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/Register/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const StrengthCheckerPage = lazy(() => import("@/pages/StrengthChecker/StrengthCheckerPage"));
const PasswordGeneratorPage = lazy(() => import("@/pages/PasswordGenerator/PasswordGeneratorPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const HistoryPage = lazy(() => import("@/pages/History/HistoryPage"));
const SettingsPage = lazy(() => import("@/pages/Settings/SettingsPage"));

// Simple Loader wrapper for Suspense fallback
const PageLoader = () => (
  <div className="w-full space-y-4 p-8">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-40 w-full animate-pulse" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  </div>
);

// Fallback 404 Component
const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
    <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-500">404</h1>
    <h2 className="mt-4 text-2xl font-bold">Access Denied / Page Not Found</h2>
    <p className="mt-2 text-gray-500 max-w-md">
      The resource you requested is restricted or does not exist. Check the URL or return to dashboard.
    </p>
    <a
      href="/dashboard"
      className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
    >
      Go to Dashboard
    </a>
  </div>
);

export const routes: RouteObject[] = [
  // Public Landing Page (Accessible by anyone)
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  // Guest only auth pages
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: "/register",
            element: (
              <Suspense fallback={<PageLoader />}>
                <RegisterPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // Authenticated App pages
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "/password-checker",
            element: (
              <Suspense fallback={<PageLoader />}>
                <StrengthCheckerPage />
              </Suspense>
            ),
          },
          {
            path: "/password-generator",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PasswordGeneratorPage />
              </Suspense>
            ),
          },
          {
            path: "/history",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HistoryPage />
              </Suspense>
            ),
          },
          {
            path: "/profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: "/settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // Catch-all
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
