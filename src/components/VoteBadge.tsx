import type { PostVote } from "@/lib/postDetails";

type Props = {
  votes: PostVote[];
};

const QUESTION_LABELS: Record<string, string> = {
  valuable_topic: "\u{1F4A1} Topic",
  sound_approach: "\u{1F9EA} Method",
};

const QUESTION_ORDER = ["valuable_topic", "sound_approach"];

export default function VoteBadge({ votes }: Props) {
  if (votes.length === 0) return null;

  const sorted = [...votes].sort(
    (a, b) => QUESTION_ORDER.indexOf(a.question) - QUESTION_ORDER.indexOf(b.question)
  );

  return (
    <div className="flex gap-1.5 flex-wrap">
      {sorted.map((v) => (
        <span
          key={v.id}
          className={`font-ibm-bios text-[10px] leading-[1.4] px-1.5 py-0.5 border ${
            v.value
              ? "border-green-4 text-green-4"
              : "border-red-4 text-red-4"
          }`}
        >
          {QUESTION_LABELS[v.question]}: {v.value ? "YES" : "NO"}
        </span>
      ))}
    </div>
  );
}
