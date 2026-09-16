import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { SEO } from "@/components/SEO";

interface StorefrontNotFoundProps {
  storefrontSlug: string;
}

export default function StorefrontNotFound({ storefrontSlug }: StorefrontNotFoundProps) {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        storefrontSlug={storefrontSlug}
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noIndex
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 300 }}
            className="mb-8"
          >
            <div className="text-9xl font-bold text-gray-200">404</div>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </motion.button>
            <motion.button
              onClick={() => navigate("/products")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </motion.button>
          </div>

          <p className="mt-12 text-sm text-gray-500">
            You're browsing <span className="font-medium">{storefrontSlug}</span> store
          </p>
        </motion.div>
      </div>
    </>
  );
}
