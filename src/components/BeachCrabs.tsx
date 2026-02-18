"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Crab from "./Crab";
import ChatBalloon, { type ChatBalloonProps } from "./ChatBalloon";
import { CRAB_COLOR_PALETTES } from "./crabColors";
import {
  CRAB_BUBBLE_POOL,
  NEW_CRAB_BUBBLE_LINES,
  ORIGINAL_CRAB_BUBBLE_LINES,
} from "./crabBubbleLines";

export type ChatData = Pick<ChatBalloonProps, "text" | "variant">;

type CrabData = {
  id: number;
  x: number;
  y: number;
  xClass: string;
  yClass: string;
  flipped: boolean;
  paletteIndex: number;
  wanderDistance: number;
  wanderDuration: number;
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function shuffleIds(ids: number[]) {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LEFT_BUCKETS = [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93] as const;
const LEFT_BUCKET_CLASSES = [
  "left-[3%]",
  "left-[8%]",
  "left-[13%]",
  "left-[18%]",
  "left-[23%]",
  "left-[28%]",
  "left-[33%]",
  "left-[38%]",
  "left-[43%]",
  "left-[48%]",
  "left-[53%]",
  "left-[58%]",
  "left-[63%]",
  "left-[68%]",
  "left-[73%]",
  "left-[78%]",
  "left-[83%]",
  "left-[88%]",
  "left-[93%]",
] as const;
const TOP_BUCKETS = [0, 5, 10, 16, 21, 26, 32, 37, 42, 48, 53, 58] as const;
const TOP_BUCKET_CLASSES = [
  "top-[0%]",
  "top-[5%]",
  "top-[10%]",
  "top-[16%]",
  "top-[21%]",
  "top-[26%]",
  "top-[32%]",
  "top-[37%]",
  "top-[42%]",
  "top-[48%]",
  "top-[53%]",
  "top-[58%]",
] as const;
const WANDER_POS_CLASSES = ["[--wander-x:10px]", "[--wander-x:14px]", "[--wander-x:18px]", "[--wander-x:22px]"] as const;
const WANDER_NEG_CLASSES = ["[--wander-x:-10px]", "[--wander-x:-14px]", "[--wander-x:-18px]", "[--wander-x:-22px]"] as const;
const WANDER_ANIM_CLASSES = [
  "[animation:crab-wander_8s_ease-in-out_infinite]",
  "[animation:crab-wander_10s_ease-in-out_infinite]",
  "[animation:crab-wander_12s_ease-in-out_infinite]",
  "[animation:crab-wander_14s_ease-in-out_infinite]",
] as const;
const WANDER_DELAY_CLASSES = [
  "[animation-delay:0s]",
  "[animation-delay:-1.3s]",
  "[animation-delay:-2.6s]",
  "[animation-delay:-3.9s]",
  "[animation-delay:-5.2s]",
] as const;

function nearestBucketClass(value: number, buckets: readonly number[], classes: readonly string[]) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < buckets.length; i += 1) {
    const distance = Math.abs(value - buckets[i]);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }
  return classes[nearestIndex];
}

export type BeachCrabsProps = {
  count?: number;
  mobileCount?: number;
  xlCount?: number;
  xxlCount?: number;
  seed?: number;
  chats?: Record<number, ChatData>;
  className?: string;
};

type ScreenTier = "mobile" | "desktop" | "xl" | "2xl";

export default function BeachCrabs({
  count = 10,
  mobileCount,
  xlCount,
  xxlCount,
  seed = 42,
  chats,
  className,
}: BeachCrabsProps) {
  const [activeChats, setActiveChats] = useState<Record<number, ChatData>>(() => chats ?? {});
  const recentChatTextsRef = useRef<string[]>(
    Object.values(chats ?? {})
      .map((entry) => entry.text)
      .slice(0, 10),
  );
  const [speakingIds, setSpeakingIds] = useState<Set<number>>(new Set());
  const lastSpokeCycleRef = useRef<Record<number, number>>({});
  const [screenTier, setScreenTier] = useState<ScreenTier>("desktop");

  const visibleCount = Math.max(1, (() => {
    switch (screenTier) {
      case "mobile": return mobileCount ?? count;
      case "xl": return xlCount ?? count;
      case "2xl": return xxlCount ?? xlCount ?? count;
      default: return count;
    }
  })());

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqXl = window.matchMedia("(min-width: 1280px)");
    const mqXxl = window.matchMedia("(min-width: 1536px)");

    const apply = () => {
      if (mqMobile.matches) setScreenTier("mobile");
      else if (mqXxl.matches) setScreenTier("2xl");
      else if (mqXl.matches) setScreenTier("xl");
      else setScreenTier("desktop");
    };

    apply();
    mqMobile.addEventListener("change", apply);
    mqXl.addEventListener("change", apply);
    mqXxl.addEventListener("change", apply);
    return () => {
      mqMobile.removeEventListener("change", apply);
      mqXl.removeEventListener("change", apply);
      mqXxl.removeEventListener("change", apply);
    };
  }, []);

  const crabs = useMemo<CrabData[]>(() => {
    const rand = seededRandom(seed);
    const slotWidth = 90 / visibleCount;
    const laneStarts = [0, 16, 32, 48];
    const laneJitter = 10;

    const generation = Array.from({ length: visibleCount }).reduce<{
      items: CrabData[];
      previousLane: number;
      laneStreak: number;
    }>(
      (state, _, i) => {
        let lane = Math.floor(rand() * laneStarts.length);

        // Keep lanes mixed so crabs don't form one flat marching line.
        if (lane === state.previousLane && state.laneStreak >= 1) {
          lane = (lane + 1 + Math.floor(rand() * (laneStarts.length - 1))) % laneStarts.length;
        }

        const nextStreak = lane === state.previousLane ? state.laneStreak + 1 : 0;
        const nextPreviousLane = lane === state.previousLane ? state.previousLane : lane;

        const nextCrab: CrabData = {
          id: i,
          x: 3 + i * slotWidth + rand() * slotWidth * 0.6,
          y: laneStarts[lane] + rand() * laneJitter,
          xClass: "",
          yClass: "",
          flipped: rand() > 0.5,
          paletteIndex: Math.floor(rand() * CRAB_COLOR_PALETTES.length),
          wanderDistance: 10 + Math.floor(rand() * 15),
          wanderDuration: 8 + rand() * 7,
        };

        nextCrab.xClass = nearestBucketClass(nextCrab.x, LEFT_BUCKETS, LEFT_BUCKET_CLASSES);
        nextCrab.yClass = nearestBucketClass(nextCrab.y, TOP_BUCKETS, TOP_BUCKET_CLASSES);

        return {
          items: [...state.items, nextCrab],
          previousLane: nextPreviousLane,
          laneStreak: nextStreak,
        };
      },
      { items: [], previousLane: -1, laneStreak: 0 },
    );

    return generation.items;
  }, [seed, visibleCount]);

  const chatIds = useMemo(
    () =>
      Object.keys(activeChats)
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id < visibleCount),
    [activeChats, visibleCount],
  );

  useEffect(() => {
    if (chatIds.length === 0) return;

    const cooldownSize = 10;

    const pushRecent = (text: string) => {
      recentChatTextsRef.current = [text, ...recentChatTextsRef.current.filter((t) => t !== text)].slice(
        0,
        cooldownSize,
      );
    };

    const timer = window.setInterval(() => {
      setActiveChats((currentChats) => {
        const targetId = chatIds[Math.floor(Math.random() * chatIds.length)];
        const currentTarget = currentChats[targetId];
        if (!currentTarget) return currentChats;

        const activeTexts = new Set(
          Object.entries(currentChats)
            .filter(([id]) => Number(id) !== targetId)
            .map(([, chat]) => chat.text),
        );
        const cooldownTexts = new Set(recentChatTextsRef.current);

        const preferredPool = Math.random() < 0.5 ? NEW_CRAB_BUBBLE_LINES : ORIGINAL_CRAB_BUBBLE_LINES;
        let candidates = preferredPool.filter(
          (line) => !activeTexts.has(line.text) && !cooldownTexts.has(line.text),
        );
        if (candidates.length === 0) {
          candidates = CRAB_BUBBLE_POOL.filter(
            (line) => !activeTexts.has(line.text) && !cooldownTexts.has(line.text),
          );
        }
        if (candidates.length === 0) {
          candidates = CRAB_BUBBLE_POOL.filter((line) => !activeTexts.has(line.text));
        }
        if (candidates.length === 0) {
          return currentChats;
        }

        const nextLine = candidates[Math.floor(Math.random() * candidates.length)];
        if (!nextLine || nextLine.text === currentTarget.text) {
          return currentChats;
        }

        pushRecent(currentTarget.text);
        pushRecent(nextLine.text);

        return {
          ...currentChats,
          [targetId]: nextLine,
        };
      });
    }, 10000);

    return () => window.clearInterval(timer);
  }, [chatIds]);

  useEffect(() => {
    if (chatIds.length === 0) return;

    const crabById = new Map(crabs.map((crab) => [crab.id, crab]));
    let disposed = false;
    let cycle = 0;
    let clearTimer: number | null = null;
    let nextCycleTimer: number | null = null;

    const isTooClose = (aId: number, bId: number) => {
      const a = crabById.get(aId);
      const b = crabById.get(bId);
      if (!a || !b) return false;

      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return dx < 16 && dy < 24;
    };

    const runCycle = () => {
      if (disposed) return;
      cycle += 1;

      const candidates = shuffleIds(chatIds);
      const selected: number[] = [];
      const maxSpeakers = screenTier === "mobile" ? 1 : Math.max(1, Math.min(4, Math.ceil(chatIds.length / 3)));
      const cooldownCycles = 2;

      for (const id of candidates) {
        if (selected.length >= maxSpeakers) break;

        const lastSpokeAt = lastSpokeCycleRef.current[id] ?? -999;
        if (cycle - lastSpokeAt <= cooldownCycles) continue;
        if (selected.some((chosen) => isTooClose(id, chosen))) continue;
        if (Math.random() > 0.7) continue;

        selected.push(id);
      }

      if (selected.length === 0) {
        for (const id of candidates) {
          const lastSpokeAt = lastSpokeCycleRef.current[id] ?? -999;
          if (cycle - lastSpokeAt <= cooldownCycles) continue;
          if (selected.some((chosen) => isTooClose(id, chosen))) continue;
          selected.push(id);
          break;
        }
      }

      selected.forEach((id) => {
        lastSpokeCycleRef.current[id] = cycle;
      });

      setSpeakingIds(new Set(selected));

      clearTimer = window.setTimeout(() => {
        if (!disposed) {
          setSpeakingIds(new Set());
        }
      }, 4200);

      nextCycleTimer = window.setTimeout(runCycle, 9000);
    };

    runCycle();

    return () => {
      disposed = true;
      if (clearTimer) window.clearTimeout(clearTimer);
      if (nextCycleTimer) window.clearTimeout(nextCycleTimer);
    };
  }, [chatIds, crabs, screenTier]);

  return (
    <div className={className ? `absolute w-full ${className}` : "absolute w-full top-[280px] h-[120px]"}>
      {crabs.map((crab) => {
        const chat = activeChats[crab.id];
        const isSpeaking = speakingIds.has(crab.id);
        const wanders = !!chat;
        const wanderDistanceClass = crab.flipped
          ? WANDER_NEG_CLASSES[crab.id % WANDER_NEG_CLASSES.length]
          : WANDER_POS_CLASSES[crab.id % WANDER_POS_CLASSES.length];
        const wanderAnimClass = WANDER_ANIM_CLASSES[crab.id % WANDER_ANIM_CLASSES.length];
        const wanderDelayClass = WANDER_DELAY_CLASSES[crab.id % WANDER_DELAY_CLASSES.length];
        return (
          <div
            key={crab.id}
            className={`absolute ${crab.xClass} ${crab.yClass} ${wanders ? `${wanderDistanceClass} ${wanderAnimClass} ${wanderDelayClass}` : ""}`}
          >
            <div className="relative">
              {chat && isSpeaking && (
                <div
                  className={`pointer-events-none absolute bottom-[calc(100%-18px)] z-10 [will-change:opacity] ${crab.flipped ? "right-[46%]" : "left-[46%]"}`}
                >
                  <ChatBalloon
                    text={chat.text}
                    variant={chat.variant}
                    tailSide={crab.flipped ? "right" : "left"}
                  />
                </div>
              )}
              <div className="pointer-events-auto cursor-pointer">
                <Crab
                  flipped={crab.flipped}
                  frameDurationMs={220 + (crab.id % 3) * 55}
                  animationOffsetMs={crab.id * 90}
                  paletteIndex={crab.paletteIndex}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
