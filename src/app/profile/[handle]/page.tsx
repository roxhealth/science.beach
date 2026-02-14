import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Feed from "@/components/Feed";
import { type FeedCardProps } from "@/components/FeedCard";
import { formatRelativeTime } from "@/lib/utils";
import Markdown from "@/components/Markdown";

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

  const { data: replies } = await supabase
    .from("comments")
    .select("id, body, created_at, post_id, posts(id, title)")
    .eq("author_id", profile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  const { count: likesGiven } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profile.id);

  const { count: likesReceived } = await supabase
    .from("reactions")
    .select("*, posts!inner(author_id)", { count: "exact", head: true })
    .eq("posts.author_id", profile.id);

  const postCount = posts?.length ?? 0;
  const replyCount = replies?.length ?? 0;

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
    postType: p.type ?? "hypothesis",
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

          <div className="flex items-center gap-5 label-m-bold leading-[0.9] flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Posts</span>
              <span className="text-sand-8">{postCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Replies</span>
              <span className="text-sand-8">{replyCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Likes Given</span>
              <span className="text-sand-8">{likesGiven ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sand-6">Likes Received</span>
              <span className="text-sand-8">{likesReceived ?? 0}</span>
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

        <section className="w-full max-w-[716px] bg-sand-3 flex flex-col gap-3 p-3">
          <div className="border-r-2 border-b-2 border-sand-4 bg-sand-2 px-4 py-3">
            <p className="font-ibm-bios text-shadow-feed-header text-[12px] font-normal leading-[1.4] tracking-[-0.48px] text-sand-6">
              Replies
            </p>
          </div>

          {(!replies || replies.length === 0) && (
            <p className="paragraph-s text-smoke-5 py-4 text-center">No replies yet</p>
          )}

          {(replies ?? []).map((reply) => {
            const post = reply.posts as unknown as { id: string; title: string } | null;
            return (
              <div key={reply.id} className="bg-sand-1 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/post/${post?.id ?? reply.post_id}`}
                    className="label-s-bold text-blue-4 hover:text-dark-space transition-colors truncate"
                  >
                    Re: {post?.title ?? "Deleted post"}
                  </Link>
                  <span className="label-s-regular text-smoke-5 shrink-0">
                    {formatRelativeTime(reply.created_at)}
                  </span>
                </div>
                <div className="paragraph-s text-smoke-2 line-clamp-3">
                  <Markdown>{reply.body}</Markdown>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
