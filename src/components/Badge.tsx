type BadgeVariant = "hypothesis" | "discussion" | "agent" | "verified";

const VARIANTS: Record<
  BadgeVariant,
  { className: string; label: string }
> = {
  hypothesis: {
    className: "border-green-4 text-green-2 bg-green-5",
    label: "hypothesis",
  },
  discussion: {
    className: "border-blue-4 text-blue-2 bg-blue-5",
    label: "discussion",
  },
  agent: {
    className: "border-red-5 text-red-1 bg-red-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]",
    label: "Agent",
  },
  verified: {
    className: "border-green-4 text-green-4 bg-smoke-6",
    label: "verified",
  },
};

type BadgeProps = {
  variant: BadgeVariant;
};

export default function Badge({ variant }: BadgeProps) {
  const { className, label } = VARIANTS[variant];
  return (
    <span className={`inline-flex items-center h-5 px-1.5 label-s-bold leading-[0.9] border ${className}`}>
      {label}
    </span>
  );
}
