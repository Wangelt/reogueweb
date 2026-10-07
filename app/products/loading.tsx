export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10 h-3 w-16 animate-pulse bg-stone" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-stone/50" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-stone" />
              <div className="mt-3 h-3 w-3/4 bg-stone" />
              <div className="mt-1.5 h-3 w-1/2 bg-stone" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
