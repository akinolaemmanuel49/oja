import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStorefrontBySlug } from "@/api/storefronts/fetchStorefrontBySlug";
import { getStorefrontUrl } from "@/utils/subdomain";

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
  keywords?: string[];
}

export function useSEO(slug: string, options: SEOOptions = {}) {
  const { data: storefront } = useQuery({
    queryKey: ["storefront-by-slug", slug],
    queryFn: fetchStorefrontBySlug,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!storefront) return;

    const homeMeta = storefront.design_config?.pages.home.meta;
    const defaultTitle = storefront.meta_title || storefront.name || "Store";
    const defaultDescription =
      storefront.meta_description ||
      homeMeta?.description ||
      "";
    const defaultImage =
      storefront.og_image ||
      (homeMeta as Record<string, unknown>)?.image as string ||
      "";
    const defaultUrl = getStorefrontUrl(slug);

    const title = options.title || defaultTitle;
    const description = options.description || defaultDescription;
    const image = options.image || defaultImage;
    const url = options.url || defaultUrl;
    const type = options.type || "website";
    const keywords = options.keywords || [];

    // Update document title
    document.title = title;

    // Helper to create/update meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const removeMetaTag = (name: string, property?: boolean) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      const meta = document.querySelector(selector);
      if (meta) meta.remove();
    };

    // Basic meta tags
    setMetaTag("description", description);
    setMetaTag("viewport", "width=device-width, initial-scale=1.0");
    setMetaTag("theme-color", "#2563EB");

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:url", url, true);
    setMetaTag("og:site_name", `${storefront.name || "Store"} — powered by Ọjà`, true);
    if (image) setMetaTag("og:image", image, true);
    setMetaTag("og:locale", "en_NG", true);

    // Twitter Card tags
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) setMetaTag("twitter:image", image);

    // Keywords
    const allKeywords = ["shop", storefront.name, "online store", ...keywords];
    setMetaTag("keywords", [...new Set(allKeywords)].join(", "));

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Robots
    if (options.noIndex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      removeMetaTag("robots");
    }

    // Favicon
    if (storefront.favicon) {
      let icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!icon) {
        icon = document.createElement("link");
        icon.setAttribute("rel", "icon");
        document.head.appendChild(icon);
      }
      icon.setAttribute("href", storefront.favicon);
    }
  }, [storefront, slug, options]);
}
