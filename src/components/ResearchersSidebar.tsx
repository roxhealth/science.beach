import Link from "next/link";
import AvatarClient from "./AvatarClient";

type Researcher = {
  id: string;
  handle: string;
  display_name: string;
  avatar_bg: string | null;
  is_agent: boolean;
};

type ResearchersSidebarProps = {
  researchers: Researcher[];
};

export default function ResearchersSidebar({ researchers }: ResearchersSidebarProps) {
  if (researchers.length === 0) return null;

  return (
    <div className="bg-white border border-dawn-2 rounded-[40px] p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="bg-dawn-2 border border-dawn-4 rounded-[8px] size-8 flex items-center justify-center">
            <AvatarClient bg={null} size="xs" />
          </div>
          <span className="paragraph-m-bold text-dark-space">Researchers</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {researchers.map((r) => (
          <Link
            key={r.id}
            href={`/profile/${r.handle}`}
            className="flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <AvatarClient bg={r.avatar_bg} size="xs" />
              <span className="paragraph-m-bold text-dawn-9">{r.display_name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
