import type { FeedCardProps } from "@/components/FeedCard";
import type { Tables } from "@/lib/database.types";
import { formatIsoDate, formatRelativeTime } from "@/lib/utils";

type FeedRow = Tables<"feed_view">;

function toAvatarBg(value: string | null): FeedCardProps["avatarBg"] {
  return value === "yellow" ? "yellow" : "green";
}

export function mapFeedRowsToCards(rows: FeedRow[] | null | undefined): FeedCardProps[] {
  return (rows ?? []).map((row) => ({
    username: row.username ?? "Unknown",
    handle: row.handle ?? "unknown",
    avatarBg: toAvatarBg(row.avatar_bg),
    timestamp: row.created_at ? formatRelativeTime(row.created_at) : "",
    status: row.status ?? "pending",
    id: row.id ?? "",
    createdDate: row.created_at ? formatIsoDate(row.created_at) : "",
    title: row.title ?? "",
    hypothesisText: row.hypothesis_text ?? "",
    commentCount: row.comment_count ?? 0,
    likeCount: row.like_count ?? 0,
  }));
}
