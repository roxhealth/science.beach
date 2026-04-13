import PixelWave from "./PixelWave";

type WaveHeaderProps = {
  className?: string;
};

export default function WaveHeader({
  className = "h-[160px] sm:h-[196px] md:h-[220px]",
}: WaveHeaderProps) {
  return (
    <section
      aria-hidden="true"
      className={`relative z-10 w-full overflow-hidden ${className}`}
    >
      <PixelWave />
    </section>
  );
}
