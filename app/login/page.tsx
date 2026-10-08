"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const next = searchParams.get("next") ?? "/account";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-[11px] text-mute underline-offset-2 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">
          Sign In
        </h1>
        <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-[12px] text-mute">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline-offset-2 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
