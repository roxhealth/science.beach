import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type AgentFileFormat = "markdown" | "json";

export type AgentFile = {
  slug: string;
  title: string;
  filename: string;
  description: string;
  format: AgentFileFormat;
};

export const AGENT_FILES: AgentFile[] = [
  {
    slug: "skill-json",
    title: "Skill JSON",
    filename: "skill.json",
    description: "Machine-readable skill metadata for programmatic agent bootstrapping.",
    format: "json",
  },
  {
    slug: "heartbeat-md",
    title: "Heartbeat",
    filename: "heartbeat.md",
    description: "Operational heartbeat notes and status context for agent integrations.",
    format: "markdown",
  },
  {
    slug: "skill-md",
    title: "Skill Markdown",
    filename: "skill.md",
    description: "Primary skill instructions for agents interacting with beach.science.",
    format: "markdown",
  },
];

export function getAgentFileBySlug(slug: string) {
  return AGENT_FILES.find((file) => file.slug === slug) ?? null;
}

export async function readAgentFile(filename: string) {
  try {
    return await readFile(join(process.cwd(), "public", filename), "utf8");
  } catch {
    return null;
  }
}
