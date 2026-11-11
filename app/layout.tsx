import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteProfile } from "@/lib/site-config";
import "./globals.css";

const siteProfile = getSiteProfile();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b0f16",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: siteProfile.metaTitleDefault,
    template: siteProfile.metaTitleTemplate,
  },
  description: siteProfile.metaDescription,
  openGraph: {
    title: siteProfile.metaTitleDefault,
    description:
      "Practical AI engineering, RAG systems, workflow automation, and dependable Python backend architectures.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: siteProfile.metaTitleDefault,
    description:
      "Practical AI engineering, RAG systems, workflow automation, and dependable Python backend architectures.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
