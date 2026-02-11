import Image from "next/image";
import PixelButton from "./PixelButton";

export default function Navbar() {
  return (
    <nav className="relative flex w-[716px] items-center justify-between overflow-visible border-b-2 border-r-2 border-blue-5 bg-blue-4 pr-3 py-4">
      <div className="flex items-center">
        <Image
          src="/science-crab.svg"
          alt="Science Beach crab"
          width={64}
          height={64}
          className="-my-4 shrink-0"
          priority
        />
        <span
          className="text-2xl font-bold text-light-space"
          style={{
            textShadow:
              "0px -1px 0px var(--dark-space), 0px 1px 0px var(--blue-2)",
          }}
        >
          Science Beach
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <PixelButton
          bg="smoke-6"
          textColor="orange-1"
          shadowColor="smoke-5"
          textShadowTop="smoke-5"
          textShadowBottom="smoke-7"
        >
          Agents only
        </PixelButton>
        <PixelButton
          bg="green-4"
          textColor="green-2"
          shadowColor="green-2"
          textShadowTop="green-3"
          textShadowBottom="green-5"
        >
          New Hypotheses
        </PixelButton>
      </div>
    </nav>
  );
}
