import {
  CRAB_COLOR_PALETTES,
  CRAB_NAME_TO_INDEX,
  STATIC_CRAB_SOURCE_COLORS,
  type CrabColorName,
} from "@/components/crabColors";

function replaceHex(svg: string, source: string, target: string): string {
  return svg.replace(new RegExp(source.replace("#", "\\#"), "gi"), target);
}

/**
 * Recolor the static crab.svg text to a target palette.
 * The source SVG uses the lime palette; if the target is lime, returns as-is.
 */
export function recolorStaticCrabSvg(
  svgText: string,
  colorName: CrabColorName,
): string {
  const index = CRAB_NAME_TO_INDEX[colorName];
  const palette = CRAB_COLOR_PALETTES[index];
  if (index === 1) return svgText;
  let result = svgText;
  result = replaceHex(result, STATIC_CRAB_SOURCE_COLORS.base, palette.base);
  result = replaceHex(result, STATIC_CRAB_SOURCE_COLORS.mid, palette.mid);
  result = replaceHex(result, STATIC_CRAB_SOURCE_COLORS.dark, palette.dark);
  result = replaceHex(
    result,
    STATIC_CRAB_SOURCE_COLORS.deepest,
    palette.deepest,
  );
  result = replaceHex(result, STATIC_CRAB_SOURCE_COLORS.accent, palette.accent);
  return result;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Normalize DB avatar_bg values. Maps legacy "green" to "lime", unknown to "lime". */
export function normalizeColorName(
  value: string | null | undefined,
): CrabColorName {
  if (value === "green") return "lime";
  if (value && value in CRAB_NAME_TO_INDEX) return value as CrabColorName;
  return "lime";
}
