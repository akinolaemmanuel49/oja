import { META_BANNER, META_LOGO } from "@/config";

type AppMetaProps = {
  title: string;
  description?: string;
  noIndex?: boolean;
  image?: string;
  canonical?: string;
};

export function AppMeta({
  title,
  description,
  noIndex,
  image = META_LOGO,
  canonical,
}: AppMetaProps) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {/* Canonical – prevents duplicate content penalty */}
      {canonical && <link rel="canonical" href={canonical} />}
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      {/* Open Graph – very important for score + social */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} /> {/* dynamic */}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={META_BANNER} />
      {/* Optional but helpful */}
      <meta name="theme-color" content="#000000" /> {/* or your brand color */}
    </>
  );
}
