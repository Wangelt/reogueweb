"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm">
            If an account with <strong>{email}</strong> exists, you&apos;ll receive a reset link shortly.
          </p>
          <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em]">Reset Password</h1>
        <p className="mb-8 text-sm text-mute">Enter your email and we&apos;ll send a reset link.</p>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input label="Email" id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
        </form>

        <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
