/**
 * Renders JSON-LD structured data in a <script type="application/ld+json"> tag.
 * Safe for SSR/CSR — the script is injected into <head> and cleaned up on unmount.
 */
import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// ---------------------------------------------------------------------------
// Pre-built schemas
// ---------------------------------------------------------------------------

interface WebSiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  logo?: string;
}

export function WebSiteSchema({ name, url, description, logo }: WebSiteSchemaProps) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description: description || "",
        ...(logo ? { logo } : {}),
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/products?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({ name, url, logo, description }: OrganizationSchemaProps) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        ...(logo ? { logo } : {}),
        ...(description ? { description } : {}),
      }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  price: number;
  priceCurrency?: string;
  availability?: string;
  brand?: string;
}

export function ProductSchema({
  name,
  description,
  url,
  image,
  price,
  priceCurrency = "NGN",
  availability = "https://schema.org/InStock",
  brand,
}: ProductSchemaProps) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url,
        ...(image ? { image } : {}),
        ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
        offers: {
          "@type": "Offer",
          url,
          priceCurrency,
          price: String(price),
          availability,
        },
      }}
    />
  );
}

interface ItemListSchemaProps {
  name: string;
  url: string;
  items: Array<{ name: string; url: string; position: number }>;
}

export function ItemListSchema({ name, url, items }: ItemListSchemaProps) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        url,
        itemListElement: items.map((item) => ({
          "@type": "ListItem",
          position: item.position,
          name: item.name,
          url: item.url,
        })),
      }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
