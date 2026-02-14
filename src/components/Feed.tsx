"use client";

import { useState, useMemo, useTransition } from "react";
import FeedCard, { type FeedCardProps } from "./FeedCard";
import PixelButton from "./PixelButton";
import { loadMorePosts } from "@/app/actions";

const PAGE_SIZE = 7;

type FeedProps = {
  items: FeedCardProps[];
  likedPostIds?: string[];
  initialHasMore?: boolean;
  className?: string;
};

export default function Feed({ items, likedPostIds = [], initialHasMore = false, className = "" }: FeedProps) {
  const [allItems, setAllItems] = useState(items);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "hypothesis" | "discussion">("all");

  const filtered = useMemo(() => {
    let result = allItems;
    if (typeFilter !== "all") {
      result = result.filter((item) => item.postType === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.hypothesisText.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          item.handle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allItems, search, typeFilter]);

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMorePosts(allItems.length);
      setAllItems((prev) => [...prev, ...next]);
      if (next.length < PAGE_SIZE) {
        setHasMore(false);
      }
    });
  }

  return (
    <section
      className={`w-full max-w-[716px] bg-sand-3 flex flex-col gap-3 p-3 ${className}`}
    >
      {/* Header */}
      <div className="border-r-2 border-b-2 border-sand-4 bg-sand-2 px-4 py-3 flex items-center justify-between">
        <p className="font-ibm-bios text-shadow-feed-header text-[12px] font-normal leading-[1.4] tracking-[-0.48px] text-sand-6">
          Popular Hypothesis
        </p>
        <button
          onClick={() => setOpen(!open)}
          className="font-ibm-bios text-[11px] text-sand-6 hover:text-sand-8 transition-colors"
        >
          Filter {open ? "v" : ">"}
        </button>
      </div>

      {/* Filter bar */}
      {open && (
        <div className="flex flex-col gap-2 bg-sand-2 border border-sand-4 p-3">
          <input
            type="text"
            placeholder="Search by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-smoke-5 bg-smoke-7 px-3 py-1.5 mono-s text-dark-space focus:outline-none focus:border-blue-4"
          />
          <div className="flex gap-0">
            {(["all", "hypothesis", "discussion"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`label-s-regular px-3 py-1 border transition-colors capitalize ${
                  typeFilter === f
                    ? "bg-dark-space text-light-space border-dark-space"
                    : "bg-smoke-7 text-smoke-2 border-smoke-5 hover:bg-smoke-6"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {(search || typeFilter !== "all") && (
            <p className="label-s-regular text-smoke-5">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      )}

      {/* Feed cards */}
      {filtered.length === 0 && (
        <p className="paragraph-s text-smoke-5 py-4 text-center">No hypothesis yet</p>
      )}
      {filtered.map((item, i) => (
        <FeedCard key={item.id || `feed-${i}`} {...item} initialLiked={likedPostIds.includes(item.id)} />
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center py-2">
          <PixelButton
            bg="smoke-7"
            textColor="smoke-5"
            shadowColor="smoke-6"
            textShadowTop="smoke-5"
            textShadowBottom="smoke-7"
            onClick={handleLoadMore}
            disabled={isPending}
            className="font-ibm-bios text-[11px]"
          >
            {isPending ? "Loading..." : "Load more"}
          </PixelButton>
        </div>
      )}
    </section>
  );
}
