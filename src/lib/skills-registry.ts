import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type SkillRegistryEntry = {
  version: string;
  description: string;
  emoji: string;
  category: string;
  files: Record<string, string>;
  companions?: string[];
  install?: string;
};

export type SkillsRegistry = {
  version: string;
  updated: string;
  base_url?: string;
  skills: Record<string, SkillRegistryEntry>;
};

export type RegistrySkill = SkillRegistryEntry & { slug: string };

const PUBLIC_DIR = join(process.cwd(), "public");
const REGISTRY_PATH = join(PUBLIC_DIR, "skills.json");

export async function readSkillsRegistry(): Promise<SkillsRegistry | null> {
  try {
    const raw = await readFile(REGISTRY_PATH, "utf-8");
    return JSON.parse(raw) as SkillsRegistry;
  } catch {
    return null;
  }
}

export function listRegistrySkills(registry: SkillsRegistry): RegistrySkill[] {
  return Object.entries(registry.skills).map(([slug, skill]) => ({
    slug,
    ...skill,
  }));
}

export function getRegistrySkill(registry: SkillsRegistry, slug: string): RegistrySkill | null {
  const skill = registry.skills[slug];
  if (!skill) return null;

  return {
    slug,
    ...skill,
  };
}

export async function readRegistryPublicFile(filePath: string): Promise<string | null> {
  const normalized = filePath.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;

  try {
    return await readFile(join(PUBLIC_DIR, normalized), "utf-8");
  } catch {
    return null;
  }
}
