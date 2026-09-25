import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-sm">
      <nav
        className="grid grid-cols-3 items-center px-5 py-4 sm:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="justify-self-start text-[11px] font-medium uppercase tracking-[0.28em]"
        >
          ReVogue
        </Link>
        <a
          href="#edit"
          className="justify-self-center text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
        >
          Shop
        </a>
        <p
          className="justify-self-end text-[11px] uppercase tracking-[0.28em] text-mute"
          aria-label="Bag, 0 items"
        >
          Bag 0
        </p>
      </nav>
    </header>
  );
}
