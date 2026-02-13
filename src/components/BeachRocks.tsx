import AnimatedSvgSprite from "./AnimatedSvgSprite";
import { SVG_SOURCE_SIZES } from "./svgSourceSizes";

const ROCKS = [
  { positionClass: "left-[30%] top-[18%]", flipped: true },
  { positionClass: "left-[62%] top-[24%]", flipped: false },
];

const SIDE_PALMS = [
  { edgeClass: "left-[-18px]", topClass: "-top-[74px] sm:-top-[94px]", flipped: false },
  { edgeClass: "right-[-18px]", topClass: "-top-[70px] sm:-top-[90px]", flipped: true },
];
type BeachRocksProps = {
  className?: string;
};

export default function BeachRocks({ className }: BeachRocksProps) {
  return (
    <div
      className={className ? `pointer-events-none absolute w-full ${className}` : "pointer-events-none absolute w-full top-[280px] h-[120px]"}
    >
      {ROCKS.map((rock, i) => (
        <div key={i} className={`absolute ${rock.positionClass}`}>
          <AnimatedSvgSprite
            name="rock"
            alt="pixel rock"
            width={SVG_SOURCE_SIZES.animated.rock.width}
            height={SVG_SOURCE_SIZES.animated.rock.height}
            flipped={rock.flipped}
            frameDurationMs={330 + (i % 2) * 80}
            animationOffsetMs={i * 140}
            fallbackSrc="/rock.svg"
          />
        </div>
      ))}
      {SIDE_PALMS.map((palm, i) => (
        <div
          key={`palm-${i}`}
          className={`absolute ${palm.topClass} ${palm.edgeClass}`}
        >
          <AnimatedSvgSprite
            name="palm"
            alt="pixel palm"
            width={SVG_SOURCE_SIZES.animated.palm.width}
            height={SVG_SOURCE_SIZES.animated.palm.height}
            flipped={palm.flipped}
            frameDurationMs={420 + i * 90}
            animationOffsetMs={i * 180}
          />
        </div>
      ))}
    </div>
  );
}
