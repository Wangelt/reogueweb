import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { usersApi } from "@/lib/api/users";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
  if (!hasToken) redirect("/login?next=/admin");

  let user;
  try {
    user = await usersApi.getMe();
  } catch {
    redirect("/login?next=/admin");
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em]">Admin</p>
        <p className="text-[12px] text-mute">{user.email}</p>
      </div>
      <div className="grid grid-cols-[180px_1fr] gap-10">
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-[13px] text-mute transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
