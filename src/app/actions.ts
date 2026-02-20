"use server";

import type { FeedCardProps } from "@/components/FeedCard";
import { mapFeedRowsToCards } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 7;

export type FeedFilters = {
  search?: string;
  type?: "all" | "hypothesis" | "discussion";
};

async function queryFeed(
  filters: FeedFilters | undefined,
  rangeStart: number,
  rangeEnd: number,
): Promise<FeedCardProps[]> {
  const supabase = await createClient();
  let query = supabase
    .from("feed_view")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.search?.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `title.ilike.%${q}%,hypothesis_text.ilike.%${q}%,username.ilike.%${q}%,handle.ilike.%${q}%`,
    );
  }

  query = query.range(rangeStart, rangeEnd);

  const { data } = await query;
  return mapFeedRowsToCards(data);
}

export async function loadMorePosts(
  offset: number,
  filters?: FeedFilters,
): Promise<FeedCardProps[]> {
  return queryFeed(filters, offset, offset + PAGE_SIZE - 1);
}

export async function loadAllPosts(
  offset: number,
  filters?: FeedFilters,
): Promise<FeedCardProps[]> {
  return queryFeed(filters, offset, offset > 0 ? offset + 999 : 999);
}
