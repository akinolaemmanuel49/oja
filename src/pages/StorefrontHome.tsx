import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";
import { SEO } from "@/components/SEO";

interface StorefrontHomeProps {
  storefrontSlug: string;
}

export default function StorefrontHome({
  storefrontSlug,
}: StorefrontHomeProps) {
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
    pageType: "home",
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

  if (!storefront) {
    return (
      <StorefrontError
        title="Store Not Found"
        message="This store does not exist or is no longer available."
      />
    );
  }

  if (!isStorefrontActive) {
    return (
      <StorefrontError
        title="Store Unavailable"
        message="This store is currently unavailable. Please check back later."
      />
    );
  }

  if (products.length === 0) {
    return (
      <StorefrontError
        title="Store has no products"
        message="This store isn't currently stocked. Please check back later."
      />
    );
  }

  if (!isPageConfigured) {
    return (
      <StorefrontError
        title="Store Not Configured"
        message="This store has not been properly configured yet. Please contact the store owner."
      />
    );
  }

  // At this point, we know pageSpec exists because isPageConfigured is true
  return (
    <>
      <SEO
        storefrontSlug={storefrontSlug}
        title={`${storefront.name} - Home`}
        description={storefront.design_config?.pages.home.meta.description}
        image=""
        keywords={[]}
        type="website"
      />

      <StorefrontProvider
        storefrontId={storefront.id}
        storefrontSlug={storefrontSlug}
        mode="storefront"
      >
        <StorefrontRenderer spec={pageSpec!} storefrontProducts={products} />
      </StorefrontProvider>
    </>
  );
}
