"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">
          Create Account
        </h1>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" id="firstName" required value={form.firstName} onChange={set("firstName")} />
            <Input label="Last Name" id="lastName" required value={form.lastName} onChange={set("lastName")} />
          </div>
          <Input label="Email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
          <Input label="Phone (optional)" id="phone" type="tel" value={form.phone} onChange={set("phone")} />
          <Input label="Password" id="password" type="password" autoComplete="new-password" required value={form.password} onChange={set("password")} />
          <Input label="Confirm Password" id="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={set("confirmPassword")} />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-mute">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
