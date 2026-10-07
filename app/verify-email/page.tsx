"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token]);

  if (status === "pending") {
    return <p className="text-sm text-mute">Verifying your email…</p>;
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-sm">Email verified successfully!</p>
        <Link href="/account" className="mt-4 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Go to account
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-red-600">{message}</p>
      <Link href="/login" className="mt-4 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}
