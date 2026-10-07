import type { Metadata } from "next";
import { Familjen_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { usersApi } from "@/lib/api/users";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import type { User } from "@/lib/api/types";
import "./globals.css";

const sans = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ReVogue",
    template: "%s · ReVogue",
  },
  description:
    "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
  applicationName: "ReVogue",
  keywords: [
    "ReVogue",
    "thrift",
    "pre-loved fashion",
    "second-hand clothing",
    "India",
  ],
  authors: [{ name: "ReVogue" }],
  creator: "ReVogue",
  publisher: "ReVogue",
  openGraph: {
    title: "ReVogue",
    description:
      "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
    siteName: "ReVogue",
    type: "website",
    locale: "en_IN",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ReVogue",
    description:
      "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);

  let initialUser: User | null = null;
  if (hasToken) {
    try {
      initialUser = await usersApi.getMe();
    } catch {
      // token invalid or expired — middleware handles redirect
    }
  }

  return (
    <html lang="en-IN" className={`${sans.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers initialUser={initialUser}>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
