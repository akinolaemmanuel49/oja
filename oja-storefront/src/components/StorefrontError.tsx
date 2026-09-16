import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface StorefrontErrorProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StorefrontError({ title, message, actionLabel, onAction }: StorefrontErrorProps) {
  return (
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
          className="flex justify-center mb-6"
        >
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>

        {actionLabel && onAction && (
          <motion.button
            onClick={onAction}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {actionLabel}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
