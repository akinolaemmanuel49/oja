import { useParams, useNavigate } from "react-router-dom";
import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";

interface StorefrontProductDetailProps {
  storefrontSlug: string;
}

export default function StorefrontProductDetail({
  storefrontSlug,
}: StorefrontProductDetailProps) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const {
    storefront,
    products,
    currentProduct,
    pageSpec,
    isLoading,
    error,
    isStorefrontActive,
    isPageConfigured,
    isProductFound,
    isProductVisible,
  } = useStorefrontPage({
    storefrontSlug,
    pageType: "product_detail",
    productId,
  });

  // Loading state
  if (isLoading) {
    return <StorefrontLoader />;
  }

  // Error states
  if (error) {
    return (
      <StorefrontError
        title="Store Not Found"
        message={`The store "${storefrontSlug}" could not be found.`}
      />
    );
  }

  if (!storefront || !isStorefrontActive) {
    return (
      <StorefrontError
        title="Store Unavailable"
        message="This store is currently unavailable."
      />
    );
  }

  if (!isPageConfigured) {
    return (
      <StorefrontError
        title="Product Not Available"
        message="Product details are not configured for this store."
      />
    );
  }

  // Product not found
  if (!isProductFound) {
    return (
      <StorefrontError
        title="Product Not Found"
        message="The product you're looking for doesn't exist or is no longer available."
        actionLabel="Browse Products"
        onAction={() => navigate("/products")}
      />
    );
  }

  // Product exists but is hidden
  if (!isProductVisible) {
    return (
      <StorefrontError
        title="Product Not Available"
        message="This product is currently not available."
        actionLabel="Browse Products"
        onAction={() => navigate("/products")}
      />
    );
  }

  // At this point, we know pageSpec exists and currentProduct exists
  return (
    <StorefrontProvider
      storefrontId={storefront.id}
      storefrontSlug={storefrontSlug}
      mode="storefront"
    >
      <StorefrontRenderer
        spec={pageSpec!}
        storefrontProducts={products}
        currentProduct={currentProduct!}
      />
    </StorefrontProvider>
  );
}
