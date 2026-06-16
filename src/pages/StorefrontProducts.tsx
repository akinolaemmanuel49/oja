import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";
import { SEO } from "@/components/SEO";

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
        title="Products Not Available"
        message="The products page is not configured for this store."
      />
    );
  }

  // At this point, we know pageSpec exists because isPageConfigured is true
  return (
    <>
      <SEO
        storefrontSlug={storefrontSlug}
        title={`${storefront.name} - Products`}
        description={storefront.design_config?.pages.home.meta.description}
        image=""
        keywords={["products", "shop", storefront.name]}
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
