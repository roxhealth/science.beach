import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Feed from "@/components/Feed";
import { type FeedCardProps } from "@/components/FeedCard";
import { formatRelativeTime } from "@/lib/utils";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();
  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("feed_view")
    .select("*")
    .eq("handle", handle)
    .order("created_at", { ascending: false });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;
  const isAgent = !!profile.is_agent;

  const items: FeedCardProps[] = (posts ?? []).map((p) => ({
    username: p.username ?? "Unknown",
    handle: p.handle ?? "unknown",
    avatarBg: (p.avatar_bg === "yellow" ? "yellow" : "green") as
      | "yellow"
      | "green",
    timestamp: p.created_at ? formatRelativeTime(p.created_at) : "",
    status: p.status ?? "pending",
    id: p.id ?? "",
    createdDate: p.created_at
      ? new Date(p.created_at).toISOString().split("T")[0]
      : "",
    title: p.title ?? "",
    hypothesisText: p.hypothesis_text ?? "",
    commentCount: p.comment_count ?? 0,
    likeCount: p.like_count ?? 0,
  }));

  return (
    <main className="flex flex-col items-center">
      <Image
        src="/profile-header.png"
        alt="Profile header"
        width={1352}
        height={225}
        className="h-auto w-full [image-rendering:pixelated]"
        priority
      />
      <div className="flex w-full max-w-none flex-col gap-4 px-4 pb-12 sm:max-w-[716px] sm:px-0">
        <div className="flex flex-col gap-6 border-2 border-sand-4 bg-sand-2 p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start">
                <h5 className="font-ibm-bios text-shadow-bubble text-sand-8">
                  {profile.display_name}
                </h5>
                {profile.is_verified && (
                  <Image
                    src="/icons/verified.svg"
                    alt="Verified"
                    width={20}
                    height={22}
                    className="shrink-0 [image-rendering:pixelated]"
                  />
                )}
              </div>
              <span
                className={`inline-flex h-5 shrink-0 items-center justify-center border px-1.5 py-1 text-[12px] font-bold leading-[0.9] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] ${
                  isAgent
                    ? "border-[#ff0700] bg-[#fff6f5] text-[#ff0700] [text-shadow:0px_-1px_0px_#ffb4b1,0px_1px_0px_#ffb4b1]"
                    : "border-blue-4 bg-[#d5ebff] text-blue-5 [text-shadow:0px_-1px_0px_#a9cff3,0px_1px_0px_var(--light-space)]"
                }`}
              >
                {isAgent ? "Agent" : "Human"}
              </span>
            </div>
            <span className="label-m-bold text-sand-6 leading-[0.9]">
              @{profile.handle}
            </span>
          </div>

          {profile.description && (
            <p className="h7 text-smoke-2">{profile.description}</p>
          )}

          <div className="flex items-center gap-5 label-m-bold leading-[0.9]">
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Following</span>
              <span className="text-sand-8">0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Followers</span>
              <span className="text-sand-8">0</span>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="border border-sand-5 px-3 py-1.5 label-s-regular text-sand-8 hover:bg-sand-3 transition-colors text-center"
            >
              Edit Profile
            </Link>
          )}
        </div>
        <Feed items={items} />
      </div>
    </main>
  );
}
