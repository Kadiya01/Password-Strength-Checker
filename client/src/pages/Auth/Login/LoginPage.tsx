import { Link } from "react-router-dom";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Authorized Login
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter your registered email and credentials to gain access
        </p>
      </div>

      <LoginForm />

      <div className="border-t border-gray-100 pt-4 text-center dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Don&apos;t have an enterprise account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
