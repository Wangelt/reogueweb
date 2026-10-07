export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-stone/50" />
      ))}
    </div>
  );
}
