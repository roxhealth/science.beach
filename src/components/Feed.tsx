"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import FeedCard, { type FeedCardProps } from "./FeedCard";
import Panel from "./Panel";
import PixelButton from "./PixelButton";
import SortBar from "./SortBar";
import { loadMorePosts, loadAllPosts, type FeedFilters } from "@/app/actions";
import type { SortMode, TimeWindow } from "@/lib/sort-modes";

const PAGE_SIZE = 7;
const DEBOUNCE_MS = 350;

type FeedProps = {
  items: FeedCardProps[];
  likedPostIds?: string[];
  initialHasMore?: boolean;
  bare?: boolean;
  className?: string;
};

export default function Feed({ items, likedPostIds = [], initialHasMore = false, bare = false, className = "" }: FeedProps) {
  const [allItems, setAllItems] = useState(items);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "hypothesis" | "discussion">("all");
  const [sortMode, setSortMode] = useState<SortMode>("breakthrough");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const [isFiltered, setIsFiltered] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFiltersRef = useRef<FeedFilters>({});

  const getFilters = useCallback(
    (overrides?: Partial<FeedFilters>): FeedFilters => ({
      search: overrides?.search ?? search,
      type: overrides?.type ?? typeFilter,
      sort: overrides?.sort ?? sortMode,
      timeWindow: overrides?.timeWindow ?? timeWindow,
    }),
    [search, typeFilter, sortMode, timeWindow],
  );

  const isNonDefaultState = useCallback(
    (filters: FeedFilters) =>
      (filters.type && filters.type !== "all") ||
      filters.search?.trim() ||
      filters.sort !== "breakthrough" ||
      filters.timeWindow !== "all",
    [],
  );

  // Re-fetch from offset 0 with current filters/sort
  const fetchFiltered = useCallback(
    (filters: FeedFilters) => {
      currentFiltersRef.current = filters;
      startTransition(async () => {
        if (currentFiltersRef.current !== filters) return;

        if (!isNonDefaultState(filters)) {
          setAllItems(items);
          setHasMore(initialHasMore);
          setIsFiltered(false);
          return;
        }

        const data = await loadAllPosts(0, filters);
        if (currentFiltersRef.current !== filters) return;

        setAllItems(data);
        setHasMore(false);
        setIsFiltered(true);
      });
    },
    [items, initialHasMore, isNonDefaultState, startTransition],
  );

  // Debounced search handler
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFiltered(getFilters({ search: value }));
    }, DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleTypeChange(type: "all" | "hypothesis" | "discussion") {
    setTypeFilter(type);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchFiltered(getFilters({ type }));
  }

  function handleSortChange(sort: SortMode) {
    setSortMode(sort);
    const newTimeWindow = sort === "most_cited" ? timeWindow : "all";
    setTimeWindow(newTimeWindow);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchFiltered(getFilters({ sort, timeWindow: newTimeWindow }));
  }

  function handleTimeWindowChange(tw: TimeWindow) {
    setTimeWindow(tw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchFiltered(getFilters({ timeWindow: tw }));
  }

  const isRandom = sortMode === "random_sample";

  function handleLoadMore() {
    const filters = getFilters();
    startTransition(async () => {
      if (isRandom) {
        // Re-roll: replace feed with fresh random set
        const data = await loadAllPosts(0, filters);
        setAllItems(data);
      } else {
        const next = await loadMorePosts(allItems.length, filters);
        setAllItems((prev) => [...prev, ...next]);
        if (next.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    });
  }

  function handleLoadAll() {
    const filters = getFilters();
    startTransition(async () => {
      const rest = await loadAllPosts(allItems.length, filters);
      setAllItems((prev) => [...prev, ...rest]);
      setHasMore(false);
    });
  }

  const Wrapper = bare ? "div" : Panel;
  const wrapperProps = bare
    ? { className: `flex flex-col gap-3 ${className}` }
    : { as: "section" as const, className: `w-full max-w-[716px] ${className}` };

  return (
    <Wrapper {...wrapperProps}>
      {/* Sort bar */}
      <div className="border-2 border-sand-3 bg-sand-1 px-4 py-3 flex flex-col gap-2">
        <SortBar
          activeSort={sortMode}
          activeTimeWindow={timeWindow}
          onSortChange={handleSortChange}
          onTimeWindowChange={handleTimeWindowChange}
        />
      </div>

      {/* Search and type filters */}
      <div className="flex flex-col gap-2 bg-sand-1 border-2 border-sand-3 p-3">
        <input
          type="text"
          placeholder="Search by title, author..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-2 border-sand-4 bg-sand-1 px-3 py-1.5 mono-s text-dark-space focus:outline-none focus:border-blue-4"
        />
        <div className="flex gap-0 w-full sm:w-auto">
          {(["all", "hypothesis", "discussion"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleTypeChange(f)}
              className={`label-s-regular flex-1 sm:flex-initial px-3 py-1 border transition-colors capitalize ${
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
          <p className="label-s-regular text-smoke-5">
            {allItems.length} result{allItems.length !== 1 ? "s" : ""}
            {hasMore ? "+" : ""}
            {isPending ? " ..." : ""}
          </p>
        )}
      </div>

      {/* Loading state */}
      {isPending && allItems.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative h-1 w-32 overflow-hidden bg-smoke-7 border border-smoke-5">
            <div className="absolute inset-0 w-1/3 bg-blue-4 animate-feed-scan" />
          </div>
          <p className="font-ibm-bios text-[11px] text-smoke-5">Analyzing data...</p>
        </div>
      )}

      {/* Feed cards */}
      {allItems.length === 0 && !isPending && (
        <p className="paragraph-s text-smoke-5 py-4 text-center">
          {isFiltered ? "No matching posts found" : "No hypothesis yet"}
        </p>
      )}
      <div className={`flex flex-col gap-3 transition-opacity duration-200 ${isPending && allItems.length > 0 ? "opacity-50 pointer-events-none" : ""}`}>
        {allItems.map((item, i) => (
          <FeedCard key={item.id || `feed-${i}`} {...item} initialLiked={likedPostIds.includes(item.id)} />
        ))}
      </div>

      {/* Load more / Load all */}
      {(hasMore || isRandom) && (
        <div className="flex justify-center gap-2 py-2">
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
            {isPending ? "Loading..." : isRandom ? "Re-roll" : "Load more"}
          </PixelButton>
          {!isRandom && (
            <PixelButton
              bg="smoke-7"
              textColor="smoke-5"
              shadowColor="smoke-6"
              textShadowTop="smoke-5"
              textShadowBottom="smoke-7"
              onClick={handleLoadAll}
              disabled={isPending}
              className="font-ibm-bios text-[11px]"
            >
              {isPending ? "Loading..." : "Load all"}
            </PixelButton>
          )}
        </div>
      )}
    </Wrapper>
  );
}
