"use client";

import { useState, useTransition, useMemo } from "react";
import { adminDeletePost, adminRestorePost, adminPurgePost } from "./actions";
import { formatRelativeTime } from "@/lib/utils";
import TextInput from "@/components/TextInput";

type Post = {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
  author_id: string;
  profiles: { handle: string; display_name: string } | null;
};

export default function AdminPostsTable({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.profiles?.handle.toLowerCase().includes(q) ||
        p.profiles?.display_name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    );
  }, [posts, search]);

  return (
    <div className="flex flex-col gap-2">
      <TextInput
        placeholder="Search posts by title, author, type..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p className="label-s-regular text-smoke-5">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      <div className="flex flex-col gap-1">
        {filtered.length === 0 && (
          <p className="paragraph-s text-smoke-5">No posts found.</p>
        )}
        {filtered.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition();
  const isDeleted = post.deleted_at !== null;

  function handleDelete() {
    startTransition(() => adminDeletePost(post.id));
  }

  function handleRestore() {
    startTransition(() => adminRestorePost(post.id));
  }

  return (
    <div className={`flex flex-col gap-2 border border-smoke-5 bg-smoke-7 p-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 ${isDeleted ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <a
            href={`/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label-s-bold text-dark-space truncate hover:text-blue-4 transition-colors"
          >
            {post.title}
          </a>
          <span className="label-s-regular text-smoke-5 shrink-0">{post.type}</span>
          {isDeleted && (
            <span className="label-s-bold text-orange-1 shrink-0">deleted</span>
          )}
        </div>
        <span className="label-s-regular text-smoke-5">
          by{" "}
          <a
            href={`/profile/${post.profiles?.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-4 transition-colors"
          >
            @{post.profiles?.handle ?? "unknown"}
          </a>
          {" "}&middot; {formatRelativeTime(post.created_at)}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={isDeleted ? handleRestore : handleDelete}
          disabled={isPending}
          className={`label-s-bold px-2 py-1 transition-colors ${
            isDeleted
              ? "text-green-2 border border-green-4 hover:bg-green-5"
              : "text-orange-1 border border-orange-1 hover:bg-smoke-6"
          } ${isPending ? "opacity-50" : ""}`}
        >
          {isDeleted ? "Restore" : "Delete"}
        </button>
        {isDeleted && (
          <button
            disabled={isPending}
            onClick={() => {
              if (!confirm("Permanently delete this post and all its comments and reactions? This cannot be undone.")) return;
              startTransition(() => adminPurgePost(post.id));
            }}
            className={`label-s-bold px-2 py-1 border text-orange-1 border-orange-1 hover:bg-smoke-6 transition-colors ${isPending ? "opacity-50" : ""}`}
          >
            Purge
          </button>
        )}
      </div>
    </div>
  );
}
