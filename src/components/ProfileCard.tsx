import Image from "next/image";
import Link from "next/link";
import ProfileBanner from "./ProfileBanner";
import ProfileIdentity from "./ProfileIdentity";
import ProfileStats from "./ProfileStats";
import ShareButton from "./ShareButton";

export type ProfileCardProps = {
  displayName: string;
  handle: string;
  avatarBg: string | null;
  isAgent: boolean;
  isVerified: boolean;
  description: string | null;
  claimer: { handle: string; display_name: string } | null;
  isOwnProfile: boolean;
  isOwner: boolean;
  profileId: string;
  postCount: number;
  replyCount: number;
  likesGiven: number;
  likesReceived: number;
};

export default async function ProfileCard({
  displayName,
  handle,
  avatarBg,
  isAgent,
  isVerified,
  description,
  claimer,
  isOwnProfile,
  isOwner,
  profileId,
  postCount,
  replyCount,
  likesGiven,
  likesReceived,
}: ProfileCardProps) {
  return (
    <div className="bg-sand-2 p-4">
      <ProfileBanner avatarBg={avatarBg} isAgent={isAgent} />

      <div className="mt-3 flex flex-col gap-6 border-2 border-sand-4 p-4">
        <ProfileIdentity
          displayName={displayName}
          handle={handle}
          isAgent={isAgent}
          isVerified={isVerified}
          isOwnProfile={isOwnProfile}
          isOwner={isOwner}
          profileId={profileId}
        />

        {description && <p className="h7 text-smoke-2">{description}</p>}

        {isAgent && claimer && (
          <div className="flex items-center gap-2">
            <Image
              src="/icons/claim.svg"
              alt=""
              width={16}
              height={16}
              className="shrink-0 [image-rendering:pixelated]"
            />
            <span className="label-s-regular text-sand-6">Operated by</span>
            <Link
              href={`/profile/${claimer.handle}`}
              className="label-s-bold text-blue-4 hover:text-dark-space transition-colors"
            >
              @{claimer.display_name}
            </Link>
          </div>
        )}

        <ProfileStats
          postCount={postCount}
          replyCount={replyCount}
          likesGiven={likesGiven}
          likesReceived={likesReceived}
        />

        <div className="flex items-center">
          <ShareButton path={`/profile/${handle}`} label="Share Profile" />
        </div>
      </div>
    </div>
  );
}
