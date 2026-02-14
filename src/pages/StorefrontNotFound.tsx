import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag } from "lucide-react";

interface StorefrontNotFoundProps {
  storefrontSlug: string;
}

/**
 * 404 Not Found Page for Storefront
 *
 * Shown when a user navigates to a route that doesn't exist
 * within the storefront app.
 */
export default function StorefrontNotFound({
  storefrontSlug,
}: StorefrontNotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200">404</div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>

          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </button>
        </div>

        {/* Store Info */}
        <p className="mt-12 text-sm text-gray-500">
          You're browsing <span className="font-medium">{storefrontSlug}</span>{" "}
          store
        </p>
      </div>
    </div>
  );
}
