import { SEAL_INFO, type SealKind } from "../utils/seal";

const TONE: Record<SealKind, string> = {
  red: "border-[#a6301f] bg-[#a6301f] text-white",
  ink: "border-ink bg-transparent text-ink",
  ok: "border-ink bg-ink text-cream",
};

export function Seal({ kind, size = 34 }: { kind: SealKind; size?: number }) {
  const info = SEAL_INFO[kind];
  return (
    <span
      aria-label={info.label}
      title={info.label}
      className={`flex flex-none items-center justify-center rounded-[3px] border-[1.5px] font-bold leading-none ${TONE[kind]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
    >
      {info.mark}
    </span>
  );
}
