"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeletePost } from "@/app/admin/actions";

export default function AdminPostActions({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this post? It will be removed from the feed.")) return;
    startTransition(async () => {
      await adminDeletePost(postId);
      router.push("/");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`label-s-bold text-orange-1 border border-orange-1 px-2 py-1 hover:bg-smoke-6 transition-colors ${isPending ? "opacity-50" : ""}`}
    >
      {isPending ? "Deleting..." : "Delete Post"}
    </button>
  );
}
