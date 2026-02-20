"use client";

import { useState } from "react";
import Icon from "./Icon";
import type { SortMode, TimeWindow } from "@/lib/sort-modes";
import { SORT_MODES, TIME_WINDOWS } from "@/lib/sort-modes";

type SortBarProps = {
  activeSort: SortMode;
  activeTimeWindow: TimeWindow;
  onSortChange: (sort: SortMode) => void;
  onTimeWindowChange: (tw: TimeWindow) => void;
};

export default function SortBar({
  activeSort,
  activeTimeWindow,
  onSortChange,
  onTimeWindowChange,
}: SortBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeConfig = SORT_MODES.find((m) => m.value === activeSort);

  return (
    <div className="flex flex-col gap-2">
      {/* Sort mode buttons — desktop */}
      <div className="hidden sm:flex gap-0">
        {SORT_MODES.map((mode) => {
          const isActive = activeSort === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => onSortChange(mode.value)}
              className={`label-s-bold flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
                isActive
                  ? "bg-dark-space text-light-space border-dark-space"
                  : "bg-smoke-7 text-smoke-2 border-smoke-5 hover:bg-smoke-6"
              }`}
              title={mode.description}
            >
              <Icon name={mode.icon} size={12} />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Sort mode — mobile */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="label-s-bold flex w-full items-center justify-between gap-1.5 border border-smoke-5 bg-smoke-7 px-3 py-1.5 text-smoke-2 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Icon name={activeConfig?.icon ?? "sort-breakthrough"} size={12} />
            {activeConfig?.label ?? "Sort"}
          </span>
          <span className="text-[10px]">{mobileOpen ? "▲" : "▼"}</span>
        </button>
        {mobileOpen && (
          <div className="flex flex-col border border-t-0 border-smoke-5">
            {SORT_MODES.map((mode) => {
              const isActive = activeSort === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => {
                    onSortChange(mode.value);
                    setMobileOpen(false);
                  }}
                  className={`label-s-regular flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                    isActive
                      ? "bg-dark-space text-light-space"
                      : "bg-smoke-7 text-smoke-2 hover:bg-smoke-6"
                  }`}
                >
                  <Icon name={mode.icon} size={12} />
                  {mode.label}
                  <span className="ml-auto text-[10px] opacity-60">
                    {mode.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active sort description */}
      <p className="font-ibm-bios text-[10px] text-smoke-5">
        {activeConfig?.description}
      </p>

      {/* Time window sub-filter for Peer Reviewed */}
      {activeConfig?.supportsTimeWindow && (
        <div className="flex gap-0">
          {TIME_WINDOWS.map((tw) => {
            const isActive = activeTimeWindow === tw.value;
            return (
              <button
                key={tw.value}
                onClick={() => onTimeWindowChange(tw.value)}
                className={`label-s-regular flex-1 sm:flex-initial px-3 py-1 border transition-colors ${
                  isActive
                    ? "bg-dark-space text-light-space border-dark-space"
                    : "bg-smoke-7 text-smoke-2 border-smoke-5 hover:bg-smoke-6"
                }`}
              >
                {tw.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
