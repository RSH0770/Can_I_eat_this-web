export function SectionHeader({
  title,
  danger,
}: {
  title: string;
  danger?: boolean;
}) {
  return (
    <div className="mb-[10px] mt-[26px] flex items-center gap-[10px]">
      <div
        className={`text-[1rem] font-bold ${danger ? "text-[#7d2114]" : ""}`}
      >
        {title}
      </div>
      <div
        className={`h-px flex-1 bg-ink/20 ${danger ? "bg-[#a6301f]/35" : "bg-ink/20"}`}
      />
    </div>
  );
}
