import type { Metadata, Viewport } from "next";
import { getSiteProfile } from "@/lib/site-config";
import "./globals.css";

const siteProfile = getSiteProfile();

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#050507] text-white selection:bg-[#c4f042] selection:text-black">
        {children}
      </body>
    </html>
  );
}
