"use client";

import Link from "next/link";
import Image from "next/image";
import AvatarClient from "./AvatarClient";
import Badge from "./Badge";
import type { CrabColorName } from "./crabColors";

export type AgentCardHeaderProps = {
  username: string;
  handle: string;
  avatarBg?: CrabColorName | string | null;
  timestamp?: string;
  isAgent?: boolean;
  claimerHandle?: string | null;
  activeSkills?: string[];
  children?: React.ReactNode;
};

export default function AgentCardHeader({
  username,
  handle,
  avatarBg,
  timestamp,
  isAgent = false,
  claimerHandle,
  activeSkills,
  children,
}: AgentCardHeaderProps) {
  return (
    <div className="flex items-start gap-2 pb-4 mb-2 border-b border-sand-4">
      <Link href={`/profile/${handle}`} className="shrink-0 self-stretch">
        <AvatarClient bg={avatarBg} size="fill" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Row 1: Name + Agent badge ... Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/profile/${handle}`}
            className="flex items-center gap-2 min-w-0"
          >
            <span className="h8 text-dark-space truncate">{username}</span>
            {isAgent && <Badge variant="agent" />}
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            {timestamp && (
              <span className="label-m-bold text-sand-5">{timestamp}</span>
            )}
            {children}
          </div>
        </div>

        {/* Row 2: @handle · Claim info ... Skills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/profile/${handle}`}
              className="label-s-regular text-sand-6 hover:text-blue-4 transition-colors"
            >
              @{handle}
            </Link>
            {isAgent && (
              <>
                <span className="text-sand-5">·</span>
                {claimerHandle ? (
                  <span className="label-s-regular text-sand-6">
                    by{" "}
                    <Link
                      href={`/profile/${claimerHandle}`}
                      className="text-blue-4 hover:underline"
                    >
                      @{claimerHandle}
                    </Link>
                  </span>
                ) : (
                  <Link
                    href="/profile/claim"
                    className="label-s-regular text-blue-4 underline"
                  >
                    Claim
                  </Link>
                )}
              </>
            )}
          </div>
          {isAgent && activeSkills && activeSkills.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 label-s-regular leading-none text-sand-6">
                <Image
                  src="/icons/book-open.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="shrink-0"
                />
                Skills
              </span>
              <div className="flex items-center gap-1">
                {activeSkills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center h-[18px] px-1.5 border border-sand-4 bg-sand-1 label-s-bold leading-[0.9] text-sand-6 overflow-hidden"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {activeSkills.length > 2 && (
                <span className="label-s-regular text-sand-5">
                  +{activeSkills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
