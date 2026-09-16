import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@oja/ui";
import { useEffect } from "react";
import { AppHref } from "@/routes/constants";
import { motion } from "motion/react";

type ErrorConfig = {
  title: string;
  message: string;
};

const ERROR_MAP: Record<number, ErrorConfig> = {
  401: { title: "Unauthorized", message: "You must be logged in to access this page." },
  403: { title: "Forbidden", message: "You do not have permission to view this page." },
  404: { title: "Page Not Found", message: "The page you are looking for does not exist." },
  500: { title: "Server Error", message: "Something went wrong on our side. Please try again." },
};

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const prevPath = (location.state as { from?: string })?.from ?? null;
  const pathMatch = location.pathname.match(/^\/(\d{3})$/);
  const status = pathMatch ? parseInt(pathMatch[1], 10) : 404;
  const error = ERROR_MAP[status] ?? ERROR_MAP[500];

  useEffect(() => {
    if (status === 401) {
      const timer = setTimeout(() => navigate(AppHref.loginRoute, { replace: true }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="text-center max-w-md"
      >
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 300 }}
          className="text-7xl font-bold text-gray-300 mb-4"
        >
          {status}
        </motion.p>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{error.title}</h1>
        {status === 404 && <p className="text-gray-600 mb-6">{prevPath}</p>}
        <p className="text-gray-600 mb-6">{error.message}</p>

        <div className="flex justify-center gap-3">
          <Button asChild variant="default">
            <Link to="/">Go Home</Link>
          </Button>

          {status !== 401 && (
            <Button variant="default" onClick={() => window.history.length > 2 ? navigate(-1) : navigate("/")}>
              Go Back
            </Button>
          )}

          {status === 401 && (
            <Button asChild variant="outline">
              <Link to={AppHref.loginRoute}>Login</Link>
            </Button>
          )}
        </div>

        {status === 401 && (
          <p className="mt-4 text-sm text-gray-500">Redirecting to login in 5 seconds...</p>
        )}
      </motion.div>
    </div>
  );
}
