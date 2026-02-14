"use client";

import Image from "next/image";
import AnimatedSvgSprite from "./AnimatedSvgSprite";
import { SVG_SOURCE_SIZES } from "./svgSourceSizes";

type AnimatedSpriteName = "palm" | "rock" | "grass" | "oasis" | "corall";

const STATIC_SPRITES = {
  blueChair: {
    src: "/simple/beachchairs/bluechair.svg",
    ...SVG_SOURCE_SIZES.static.blueChair,
  },
  redChair: {
    src: "/simple/beachchairs/redchair.svg",
    ...SVG_SOURCE_SIZES.static.redChair,
  },
} as const;

type StaticSpriteName = keyof typeof STATIC_SPRITES;

export type BeachSpriteProps = {
  /** Tailwind position classes, e.g. "left-[30%] top-[18%]" */
  className?: string;
  flipped?: boolean;
  opacity?: string;
  /** Hide below this breakpoint */
  hideBelow?: "sm" | "md" | "lg" | "xl";
} & (
  | {
      kind: "animated";
      name: AnimatedSpriteName;
      frameSrcs?: string[];
      frameDurationMs?: number;
      animationOffsetMs?: number;
    }
  | {
      kind: "static";
      name: StaticSpriteName;
    }
);

export default function BeachSprite(props: BeachSpriteProps) {
  const {
    className = "",
    flipped = false,
    opacity = "opacity-90",
    hideBelow,
  } = props;

  const visibilityClass = hideBelow ? `hidden ${hideBelow}:block` : "";

  const wrapperClasses = [
    "absolute pointer-events-none",
    className,
    opacity,
    visibilityClass,
    flipped ? "[transform:scaleX(-1)]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.kind === "animated") {
    const size = SVG_SOURCE_SIZES.animated[props.name];
    return (
      <div className={wrapperClasses}>
        <AnimatedSvgSprite
          name={props.name}
          alt={`pixel ${props.name}`}
          width={size.width}
          height={size.height}
          frameSrcs={props.frameSrcs}
          flipped={false}
          frameDurationMs={props.frameDurationMs ?? 300}
          animationOffsetMs={props.animationOffsetMs ?? 0}
        />
      </div>
    );
  }

  const sprite = STATIC_SPRITES[props.name];
  return (
    <div className={wrapperClasses}>
      <Image
        src={sprite.src}
        alt={`pixel ${props.name}`}
        width={sprite.width}
        height={sprite.height}
        className="[image-rendering:pixelated]"
      />
    </div>
  );
}

export type BeachScene = {
  className: string;
  hideBelow?: "sm" | "md" | "lg" | "xl";
  sprites: BeachSpriteProps[];
};

export type BeachSceneGroupProps = {
  scene: BeachScene;
};

export function BeachSceneGroup({ scene }: BeachSceneGroupProps) {
  const visibilityClass = scene.hideBelow
    ? `hidden ${scene.hideBelow}:block`
    : "";

  return (
    <div
      className={`absolute pointer-events-none ${scene.className} ${visibilityClass}`}
    >
      {scene.sprites.map((spriteProps, i) => (
        <BeachSprite key={i} {...spriteProps} />
      ))}
    </div>
  );
}
