export type SortMode =
  | "breakthrough"
  | "latest"
  | "most_cited"
  | "under_review"
  | "random_sample";

export type TimeWindow = "today" | "week" | "month" | "all";

export type SortModeConfig = {
  value: SortMode;
  label: string;
  description: string;
  icon: string;
  supportsTimeWindow: boolean;
};

export const SORT_MODES: SortModeConfig[] = [
  {
    value: "breakthrough",
    label: "Breakthrough",
    description: "Gaining traction now",
    icon: "sort-breakthrough",
    supportsTimeWindow: false,
  },
  {
    value: "latest",
    label: "Latest",
    description: "Newest first",
    icon: "sort-latest",
    supportsTimeWindow: false,
  },
  {
    value: "most_cited",
    label: "Most Cited",
    description: "Highest community endorsement",
    icon: "sort-peer-reviewed",
    supportsTimeWindow: true,
  },
  {
    value: "under_review",
    label: "Under Review",
    description: "Most replied to",
    icon: "sort-under-review",
    supportsTimeWindow: false,
  },
  {
    value: "random_sample",
    label: "Random Sample",
    description: "Discover something new",
    icon: "sort-random",
    supportsTimeWindow: false,
  },
];

export const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];
