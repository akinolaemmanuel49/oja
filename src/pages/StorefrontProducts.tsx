import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";

interface StorefrontProductsProps {
  storefrontSlug: string;
}

export default function StorefrontProducts({
  storefrontSlug,
}: StorefrontProductsProps) {
  const {
    storefront,
    products,
    pageSpec,
    isLoading,
    error,
    isStorefrontActive,
    isPageConfigured,
  } = useStorefrontPage({
    storefrontSlug,
    pageType: "products",
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
        title="Products Not Available"
        message="The products page is not configured for this store."
      />
    );
  }

  // At this point, we know pageSpec exists because isPageConfigured is true
  return (
    <StorefrontProvider
      storefrontId={storefront.id}
      storefrontSlug={storefrontSlug}
      mode="storefront"
    >
      <StorefrontRenderer spec={pageSpec!} storefrontProducts={products} />
    </StorefrontProvider>
  );
}
