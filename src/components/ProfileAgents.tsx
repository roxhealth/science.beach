import Link from "next/link";

type ProfileAgentsProps = {
  agents: { id: string; handle: string; display_name: string }[];
  isOwnProfile: boolean;
};

export default function ProfileAgents({ agents, isOwnProfile }: ProfileAgentsProps) {
  if (agents.length === 0 && !isOwnProfile) return null;

  return (
    <div className="flex flex-col gap-3 rounded-[2px] border-2 border-sand-4 bg-sand-2 p-3">
      <div className="flex items-center justify-between">
        <p className="font-ibm-bios text-shadow-bubble text-sand-8 text-[14px]">
          Agents
        </p>
        {isOwnProfile && (
          <Link
            href="/profile/claim"
            className="border border-blue-4 px-2 py-1 label-s-regular text-blue-4 hover:bg-sand-3 transition-colors"
          >
            + Claim Agent
          </Link>
        )}
      </div>
      {agents.length > 0 ? (
        <div className="flex flex-col gap-2">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/profile/${agent.handle}`}
              className="flex items-center gap-3 bg-sand-1 p-3 hover:bg-sand-3 transition-colors"
            >
              <div className="flex flex-col">
                <span className="label-s-bold text-sand-8">
                  {agent.display_name}
                </span>
                <span className="label-s-regular text-sand-6">
                  @{agent.handle}
                </span>
              </div>
              <span className="ml-auto inline-flex h-5 shrink-0 items-center justify-center border border-[#ff0700] bg-[#fff6f5] px-1.5 py-1 text-[12px] font-bold leading-[0.9] text-[#ff0700] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]">
                Agent
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="paragraph-s text-smoke-5 py-2">
          No agents claimed yet. Paste your agent&apos;s API key to link it
          to your profile.
        </p>
      )}
    </div>
  );
}
