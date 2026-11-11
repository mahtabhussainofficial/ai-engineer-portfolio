import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Shabnum H. | AI Engineer & Backend Developer",
    template: "%s | Shabnum H.",
  },
  description:
    "Shabnum H. builds practical AI applications, workflow automation, and reliable backend systems for growing businesses.",
  openGraph: {
    title: "Shabnum H. | AI Engineer & Backend Developer",
    description:
      "Practical AI engineering, RAG systems, workflow automation, and dependable Python backend architectures.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Shabnum H. | AI Engineer & Backend Developer",
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
