"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return <p className="text-sm text-red-600">Invalid or missing reset token.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <p className="text-sm">Password reset successfully. Redirecting to sign in…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <Input label="New Password" id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Input label="Confirm Password" id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <Button type="submit" loading={loading} className="w-full">Set New Password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">Set New Password</h1>
        <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />}>
          <ResetForm />
        </Suspense>
        <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
