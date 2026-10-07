"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/providers";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-background/90 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
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

        <Link
          href="/products"
          className="justify-self-center text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
        >
          Shop
        </Link>

        <div className="justify-self-end flex items-center gap-5">
          {user ? (
            <Link
              href="/account"
              className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            >
              Login
            </Link>
          )}
          <Link
            href="/cart"
            className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            aria-label={`Bag, ${count} items`}
          >
            Bag {count > 0 ? count : ""}
          </Link>
        </div>
      </nav>
    </header>
  );
}
