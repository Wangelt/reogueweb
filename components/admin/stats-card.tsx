interface StatsCardProps {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="border border-line p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-mute">{label}</p>
      <p className="mt-3 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
