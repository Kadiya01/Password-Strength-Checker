import { Link } from "react-router-dom";
import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Register Security Account
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Create an account to track evaluations and manage credentials
        </p>
      </div>

      <RegisterForm />

      <div className="border-t border-gray-100 pt-4 text-center dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Already have a Sentinel account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
