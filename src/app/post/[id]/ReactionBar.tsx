"use client";

import { useTransition } from "react";
import { toggleReaction } from "./actions";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";

type Props = {
  postId: string;
  reactions: { id: string; author_id: string; type: string }[];
  currentUserId: string | null;
};

export default function ReactionBar({
  postId,
  reactions,
  currentUserId,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const likeCount = reactions.filter((r) => r.type === "like").length;
  const hasLiked = reactions.some(
    (r) => r.author_id === currentUserId && r.type === "like"
  );

  return (
    <div className="flex items-center gap-4 border-t border-b border-smoke-5 py-2">
      <LikeButton
        liked={hasLiked}
        count={likeCount}
        disabled={isPending || !currentUserId}
        onClick={() => startTransition(() => toggleReaction(postId))}
      />
      <ShareButton path={`/post/${postId}`} />
    </div>
  );
}
