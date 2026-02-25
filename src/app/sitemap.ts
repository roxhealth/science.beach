import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/docs`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, updated_at")
    .is("deleted_at", null)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(1000);

  const postPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("handle, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1000);

  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${baseUrl}/profile/${p.handle}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...profilePages];
}
