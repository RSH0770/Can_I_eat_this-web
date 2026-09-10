export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-[10px] mt-[26px] flex items-center gap-[10px]">
      <div className="text-[1rem] font-bold">{title}</div>
      <div className="h-px flex-1 bg-ink/20" />
    </div>
  );
}
