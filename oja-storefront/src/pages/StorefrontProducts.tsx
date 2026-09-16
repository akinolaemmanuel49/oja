import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";
import { SEO } from "@/components/SEO";
import { ItemListSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { getStorefrontUrl } from "@/utils/subdomain";

interface StorefrontProductsProps {
  storefrontSlug: string;
}

export default function StorefrontProducts({ storefrontSlug }: StorefrontProductsProps) {
  const {
    storefront,
    products,
    pageSpec,
    isLoading,
    error,
    isStorefrontActive,
    isPageConfigured,
  } = useStorefrontPage({ storefrontSlug, pageType: "products" });

  if (isLoading) return <StorefrontLoader />;
  if (error) return <StorefrontError title="Store Not Found" message={`The store "${storefrontSlug}" could not be found.`} />;
  if (!storefront || !isStorefrontActive) return <StorefrontError title="Store Unavailable" message="This store is currently unavailable." />;
  if (products.length === 0) return <StorefrontError title="Store has no products" message="This store isn't currently stocked. Please check back later." />;
  if (!isPageConfigured) return <StorefrontError title="Products Not Available" message="The products page is not configured for this store." />;

  const storeUrl = getStorefrontUrl(storefrontSlug);
  const meta = storefront.design_config?.pages.products?.meta;

  return (
    <>
      <SEO
        storefrontSlug={storefrontSlug}
        title={meta?.title || `${storefront.name} — Products`}
        description={meta?.description || `Browse all products at ${storefront.name}.`}
        image={(meta as Record<string, unknown>)?.image as string || ""}
        type="website"
        keywords={["products", "shop", storefront.name]}
      />

      <ItemListSchema
        name={`${storefront.name} Products`}
        url={`${storeUrl}/products`}
        items={products.slice(0, 50).map((p, i) => ({
          name: p.product_name,
          url: `${storeUrl}/products/${p.product_id}`,
          position: i + 1,
        }))}
      />
      <BreadcrumbSchema items={[
        { name: "Home", url: storeUrl },
        { name: "Products", url: `${storeUrl}/products` },
      ]} />

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
