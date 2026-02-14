/**
 * StorefrontLoader Component
 *
 * Displays a loading spinner while the storefront data is being fetched.
 * Provides a consistent loading experience across all storefront pages.
 */
export function StorefrontLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block relative w-20 h-20 mb-6">
          <div className="absolute border-4 border-gray-200 border-t-blue-600 rounded-full w-20 h-20 animate-spin"></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Store
        </h2>
        <p className="text-gray-600">
          Please wait while we prepare your shopping experience...
        </p>
      </div>
    </div>
  );
}
