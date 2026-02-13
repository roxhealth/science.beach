"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type AnimatedSvgSpriteProps = {
  name: string;
  alt: string;
  width: number;
  height: number;
  frameSrcs?: string[];
  flipped?: boolean;
  animate?: boolean;
  frameDurationMs?: number;
  animationOffsetMs?: number;
  fallbackSrc?: string;
  priority?: boolean;
  unoptimized?: boolean;
};

export default function AnimatedSvgSprite({
  name,
  alt,
  width,
  height,
  frameSrcs,
  flipped = false,
  animate = true,
  frameDurationMs = 260,
  animationOffsetMs = 0,
  fallbackSrc,
  priority = false,
  unoptimized = false,
}: AnimatedSvgSpriteProps) {
  const frames = useMemo(() => {
    if (frameSrcs && frameSrcs.length > 0) {
      return frameSrcs;
    }

    return [`/animated/${name}/${name}-0.svg`, `/animated/${name}/${name}-1.svg`];
  }, [frameSrcs, name]);
  const frameCount = frames.length;
  const stepMs = Math.max(80, frameDurationMs);
  const [frameIndex, setFrameIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const cycleMs = stepMs * frameCount;
  const normalizedOffset = cycleMs > 0 ? ((animationOffsetMs % cycleMs) + cycleMs) % cycleMs : 0;
  const offsetFrame = frameCount > 0 ? Math.floor(normalizedOffset / stepMs) : 0;

  useEffect(() => {
    if (!animate || frameCount <= 1 || failed) return;

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frameCount);
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [animate, failed, frameCount, stepMs]);

  const displayFrame = !animate || failed || frameCount <= 1 ? 0 : (frameIndex + offsetFrame) % frameCount;
  const src = failed && fallbackSrc ? fallbackSrc : (frames[displayFrame] ?? frames[0]);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => {
        if (fallbackSrc) setFailed(true);
      }}
      className={`[image-rendering:pixelated] ${flipped ? "[transform:scaleX(-1)]" : ""}`}
    />
  );
}
