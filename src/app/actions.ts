"use server";

import type { FeedCardProps } from "@/components/FeedCard";
import { mapFeedRowsToCards } from "@/lib/feed";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 7;

export async function loadMorePosts(offset: number): Promise<FeedCardProps[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feed_view")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return mapFeedRowsToCards(data);
}
