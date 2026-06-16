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

    // Default values from storefront
    const defaultTitle = storefront.name || "Store";
    const defaultDescription =
      storefront.design_config?.pages.home.meta.description || "";
    const defaultImage = "";
    const defaultUrl = getStorefrontUrl(slug);

    // Merge with page-specific options
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

    // Helper to remove meta tags
    const removeMetaTag = (name: string, property?: boolean) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      const meta = document.querySelector(selector);
      if (meta) meta.remove();
    };

    // Update basic meta tags
    setMetaTag("description", description);

    // Update Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:image", image, true);
    setMetaTag("og:url", url, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:site_name", storefront.name || "Store", true);

    // Update Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", image);

    // Update keywords
    if (keywords.length > 0) {
      setMetaTag("keywords", keywords.join(", "));
    }

    // Update canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // // Update favicon
    // if (storefront.faviconUrl) {
    //   let favicon = document.querySelector(
    //     'link[rel="icon"]',
    //   ) as HTMLLinkElement;
    //   if (!favicon) {
    //     favicon = document.createElement("link");
    //     favicon.setAttribute("rel", "icon");
    //     document.head.appendChild(favicon);
    //   }
    //   favicon.setAttribute("href", storefront.faviconUrl);
    // }

    // // Update theme color
    // if (storefront.themeColor) {
    //   setMetaTag("theme-color", storefront.themeColor);
    // }

    // Handle no-index
    if (options.noIndex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      removeMetaTag("robots");
    }

    // Cleanup function
    return () => {
      // Optionally remove tags on unmount
      // We keep them since the page is navigating away anyway
    };
  }, [storefront, slug, options]);
}
