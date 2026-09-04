import { useParams, useNavigate } from "react-router-dom";
import { useStorefrontPage } from "@/hooks/useStorefrontPage";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "@/components/StorefrontRenderer";
import { StorefrontLoader } from "@/components/StorefrontLoader";
import { StorefrontError } from "@/components/StorefrontError";
import { SEO } from "@/components/SEO";
import { ProductSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { getStorefrontUrl } from "@/utils/subdomain";

interface StorefrontProductDetailProps {
  storefrontSlug: string;
}

export default function StorefrontProductDetail({ storefrontSlug }: StorefrontProductDetailProps) {
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

  if (isLoading) return <StorefrontLoader />;
  if (error) return <StorefrontError title="Store Not Found" message={`The store "${storefrontSlug}" could not be found.`} />;
  if (!storefront || !isStorefrontActive) return <StorefrontError title="Store Unavailable" message="This store is currently unavailable." />;
  if (!isPageConfigured) return <StorefrontError title="Product Not Available" message="Product details are not configured for this store." />;
  if (!isProductFound) return <StorefrontError title="Product Not Found" message="The product you're looking for doesn't exist or is no longer available." actionLabel="Browse Products" onAction={() => navigate("/products")} />;
  if (!isProductVisible) return <StorefrontError title="Product Not Available" message="This product is currently not available." actionLabel="Browse Products" onAction={() => navigate("/products")} />;

  const storeUrl = getStorefrontUrl(storefrontSlug);
  const productUrl = `${storeUrl}/products/${currentProduct?.product_id}`;

  // Calculate display price for schema
  let displayPrice = 0;
  if (currentProduct) {
    if (currentProduct.product_type === "simple") {
      displayPrice = currentProduct.base_price ?? 0;
    } else if (currentProduct.variants && currentProduct.variants.length > 0) {
      displayPrice = currentProduct.variants[0]?.price ?? 0;
    }
  }

  const productImage = currentProduct?.product_type === "simple"
    ? currentProduct.main_image_url
    : currentProduct?.variants?.[0]?.main_image_url;

  return (
    <>
      <SEO
        storefrontSlug={storefrontSlug}
        title={`${currentProduct?.product_name} — ${storefront.name}`}
        description={currentProduct?.product_description || `${currentProduct?.product_name} available at ${storefront.name}.`}
        image={productImage || ""}
        url={productUrl}
        type="product"
        keywords={[currentProduct?.product_name || "", "product", "shop", storefront.name]}
      />

      {currentProduct && (
        <ProductSchema
          name={currentProduct.product_name}
          description={currentProduct.product_description || currentProduct.product_name}
          url={productUrl}
          image={productImage || undefined}
          price={displayPrice}
          priceCurrency="NGN"
          availability={
            currentProduct.product_type === "simple" || (currentProduct.variants && currentProduct.variants.some(v => (v.stock_quantity ?? 0) > 0))
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          }
          brand={storefront.name}
        />
      )}

      <BreadcrumbSchema items={[
        { name: "Home", url: storeUrl },
        { name: "Products", url: `${storeUrl}/products` },
        { name: currentProduct?.product_name || "Product", url: productUrl },
      ]} />

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
    </>
  );
}
