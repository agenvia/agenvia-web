import { siteConfig, useCases } from "@/lib/promptrak-content";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/product",
    "/live-demo",
    "/dashboard",
    "/request-trace",
    "/fl-intelligence",
    "/pattern-repository",
    "/alerts",
    "/policy-studio",
    "/pricing",
    "/trust",
    "/use-cases",
    ...useCases.map((item) => `/use-cases/${item.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
