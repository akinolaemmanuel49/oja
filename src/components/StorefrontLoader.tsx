import { motion } from "motion/react";

export function StorefrontLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="text-center"
      >
        <div className="inline-block relative w-20 h-20 mb-6">
          <div className="absolute border-4 border-gray-200 border-t-blue-600 rounded-full w-20 h-20 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Store</h2>
        <p className="text-gray-600">Please wait while we prepare your shopping experience...</p>
      </motion.div>
    </div>
  );
}
