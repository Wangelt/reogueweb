export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse bg-stone" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse bg-stone" />
          <div className="h-6 w-3/4 animate-pulse bg-stone" />
          <div className="h-6 w-20 animate-pulse bg-stone" />
        </div>
      </div>
    </main>
  );
}
