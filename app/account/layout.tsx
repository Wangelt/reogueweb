import Link from "next/link";

const NAV = [
  { href: "/account", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
];

export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">Account</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-5 md:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
