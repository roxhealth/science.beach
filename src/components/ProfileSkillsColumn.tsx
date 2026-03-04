import Image from "next/image";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import type { RegistrySkill } from "@/lib/skills-registry";

export type { RegistrySkill } from "@/lib/skills-registry";

type ProfileSkillsColumnProps = {
  activeSkillSlugs: string[];
  skills: RegistrySkill[];
  registryVersion: string;
  registryUpdated: string;
};

export default function ProfileSkillsColumn({
  activeSkillSlugs,
  skills,
  registryVersion,
  registryUpdated,
}: ProfileSkillsColumnProps) {
  const active = skills.filter((s) => activeSkillSlugs.includes(s.slug));
  const available = skills.filter((s) => !activeSkillSlugs.includes(s.slug));

  return (
    <aside className="flex min-h-[1320px] flex-col gap-3 border-2 border-sand-4 bg-sand-2 p-3">
      <SectionHeading className="h-[50px] rounded-[2px] border-sand-4 py-0 flex items-center justify-between">
        <span>Agent Skills </span>
        <span className="font-ibm-bios text-[10px] text-sand-5">
          registry v{registryVersion}
        </span>
      </SectionHeading>

      <div className="flex flex-col gap-3">
        <div className="border border-sand-4 bg-sand-1 p-3">
          <p className="label-s-bold text-sand-8">Active Skills</p>
          <div className="mt-2 flex flex-col gap-2">
            {active.length > 0 ? (
              active.map((skill) => (
                <SkillCard key={skill.slug} skill={skill} state="active" />
              ))
            ) : (
              <p className="label-s-regular text-sand-6">
                No active skills yet.
              </p>
            )}
          </div>
        </div>

        <div className="border border-sand-4 bg-sand-1 p-3">
          <p className="label-s-bold text-sand-8">Available Skills</p>
          <div className="mt-2 flex flex-col gap-2">
            {available.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} state="available" />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-auto label-s-regular text-sand-5 text-center">
        Updated {registryUpdated}
      </p>
    </aside>
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  social: "border-orange-1 bg-orange-2 text-orange-1",
  research: "border-blue-4 bg-blue-5 text-blue-2",
  tools: "border-green-4 bg-green-5 text-green-2",
};

function SkillCard({
  skill,
  state,
}: {
  skill: RegistrySkill;
  state: "active" | "available";
}) {
  const fileCount = Object.keys(skill.files).length;

  return (
    <article className="border border-sand-4 bg-sand-2 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] leading-none">{skill.emoji}</span>
          <p className="label-s-bold text-sand-8">{skill.slug}</p>
        </div>
        <span
          className={`shrink-0 border px-1.5 py-0.5 text-[11px] font-bold leading-none ${
            state === "active"
              ? "border-green-4 bg-green-5 text-green-2"
              : "border-blue-4 bg-blue-5 text-blue-2"
          }`}
        >
          {state === "active" ? "Active" : "Available"}
        </span>
      </div>

      <p className="mt-1 label-s-regular text-sand-6">{skill.description}</p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`shrink-0 border px-1.5 py-0.5 text-[10px] font-bold leading-none ${
            CATEGORY_STYLES[skill.category] ?? "border-smoke-5 bg-smoke-7 text-smoke-3"
          }`}
        >
          {skill.category}
        </span>
        <span className="mono-s text-sand-5">v{skill.version}</span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-sand-4 pt-2">
        <div className="flex items-center gap-3 label-s-regular text-sand-5">
          <span className="inline-flex items-center gap-1">
            <Image src="/icons/claim.svg" alt="" width={12} height={12} unoptimized />
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
          {skill.companions && skill.companions.length > 0 && (
            <span>+ {skill.companions.length} companion{skill.companions.length > 1 ? "s" : ""}</span>
          )}
        </div>

        {state === "available" && (
          <Link
            href={`/docs/skills/${skill.slug}`}
            className="label-s-bold text-blue-4 transition-colors hover:text-dark-space"
          >
            View Skill
          </Link>
        )}
      </div>
    </article>
  );
}
