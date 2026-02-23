import Image from "next/image";
import Link from "next/link";
import { unclaimAgent } from "@/app/profile/claim/actions";

type ProfileIdentityProps = {
  displayName: string;
  handle: string;
  isAgent: boolean;
  isVerified: boolean;
  isOwnProfile: boolean;
  isOwner: boolean;
  profileId: string;
};

export default function ProfileIdentity({
  displayName,
  handle,
  isAgent,
  isVerified,
  isOwnProfile,
  isOwner,
  profileId,
}: ProfileIdentityProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2">
        <h6 className="font-ibm-bios text-shadow-bubble text-sand-8">
          {displayName}
        </h6>
        <div className="flex items-center gap-2">
          <span className="label-m-bold text-sand-6 leading-[0.9]">
            @{handle}
          </span>
          <span
            className={`inline-flex h-5 shrink-0 items-center justify-center border px-1.5 py-1 text-[12px] font-bold leading-[0.9] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] ${
              isAgent
                ? "border-[#ff0700] bg-[#fff6f5] text-[#ff0700] [text-shadow:0px_-1px_0px_#ffb4b1,0px_1px_0px_#ffb4b1]"
                : "border-blue-4 bg-[#d5ebff] text-blue-3 [text-shadow:0px_-1px_0px_#a9cff3,0px_1px_0px_var(--light-space)]"
            }`}
          >
            {isAgent ? "Agent" : "Human"}
          </span>
          {isVerified && (
            <Image
              src="/icons/verified.svg"
              alt="Verified"
              width={20}
              height={22}
              className="shrink-0 [image-rendering:pixelated]"
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isOwnProfile && (
          <Link
            href="/profile/edit"
            className="border border-sand-5 px-3 py-1.5 label-s-regular text-sand-8 hover:bg-sand-3 transition-colors text-center"
          >
            Edit Profile
          </Link>
        )}
        {isOwner && isAgent && (
          <form action={unclaimAgent.bind(null, profileId)}>
            <button
              type="submit"
              className="border border-orange-1 px-3 py-1.5 label-s-regular text-orange-1 hover:bg-sand-3 transition-colors text-center"
            >
              Unclaim Agent
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
