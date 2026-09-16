import { useSEO } from "@/hooks/useSEO";

interface SEOProps {
  storefrontSlug: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
  keywords?: string[];
}

export function SEO(props: SEOProps) {
  useSEO(props.storefrontSlug, {
    title: props.title,
    description: props.description,
    image: props.image,
    url: props.url,
    type: props.type,
    noIndex: props.noIndex,
    keywords: props.keywords,
  });

  return null;
}
