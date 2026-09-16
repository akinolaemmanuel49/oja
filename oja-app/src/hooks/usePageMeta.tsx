import { errorRoutes, protectedRoutes, publicRoutes } from "@/routes/config";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageMeta() {
  const location = useLocation();

  const allRoutes = [...protectedRoutes, ...publicRoutes, ...errorRoutes];

  // Try to match more precisely than just first segment
  const matchedRoute = allRoutes.find((route) => {
    // exact match or parameterized prefix match
    if (route.path === location.pathname) return true;
    const routeSegments = route.path.split("/").filter(Boolean);
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return routeSegments.every((seg, i) => {
      if (seg.startsWith(":")) return true; // wildcard param
      return seg === pathSegments[i];
    });
  });

  const meta = matchedRoute?.meta;

  useEffect(() => {
    if (!meta) return;

    // Title
    document.title = meta.title;

    // Meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag && meta.description) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    if (descTag) {
      if (meta.description) {
        descTag.setAttribute("content", meta.description);
      } else {
        descTag.remove();
      }
    }

    // Robots
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (meta.noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement("meta");
        robotsTag.setAttribute("name", "robots");
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute("content", "noindex,nofollow");
    } else if (robotsTag) {
      robotsTag.remove();
    }

    // Open Graph + Twitter (similar pattern)
    const updateMeta = (property: string, content?: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (content) {
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      } else if (tag) {
        tag.remove();
      }
    };

    updateMeta("og:title", meta.title);
    updateMeta("og:description", meta.description);
    updateMeta("twitter:title", meta.title);
    updateMeta("twitter:description", meta.description);

    // Cleanup on unmount / route change
    return () => {
      // optional: remove tags if you want strict cleanup
    };
  }, [meta]);

  // You can still render <AppMeta /> for SSR compatibility if needed
  return meta;
}
