type FontSizeControllerProps = {
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
};

const STEPPER_BUTTON_CLASS =
  "inline-flex min-w-[30px] h-[30px] items-center justify-center gap-[1px] " +
  "rounded-[3px] border-[1.5px] border-ink px-[7px] font-bold tracking-[-0.02em] " +
  "transition-colors duration-[120ms] " +
  "hover:bg-ink hover:text-[#e9e7e2] active:bg-[#3a352f] active:text-[#e9e7e2] " +
  "disabled:cursor-not-allowed disabled:border-ink/[0.28] disabled:bg-transparent disabled:text-ink/[0.32] disabled:opacity-100";

export function FontSizeController({
  onIncrease,
  onDecrease,
  canIncrease,
  canDecrease,
}: FontSizeControllerProps) {
  return (
    <div className="flex gap-[4px]">
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label="글씨 작게"
        className={STEPPER_BUTTON_CLASS}
      >
        <span className="text-[11px]">가</span>
        <span className="text-[12px]">−</span>
      </button>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label="글씨 크게"
        className={STEPPER_BUTTON_CLASS}
      >
        <span className="text-[17px]">가</span>
        <span className="text-[12px]">+</span>
      </button>
    </div>
  );
}
