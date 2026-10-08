"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-left text-[12px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-foreground disabled:opacity-50"
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
