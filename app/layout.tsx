import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./globals.css";

const codecPro = localFont({
  src: [
    { path: "./fonts/CodecPro-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/CodecPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/CodecPro-News.ttf", weight: "500", style: "normal" },
    { path: "./fonts/CodecPro-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-codec-pro",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://damanvirtual.com"),
  title: "Daman Virtual",
  description: "Seamless. Secure. Safeguarded.",
  openGraph: {
    title: "Daman Virtual",
    description: "Seamless. Secure. Safeguarded.",
    siteName: "Daman Virtual",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#111010",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` is always on — the brand has no light mode. It makes shadcn's
    // `dark:` variants resolve correctly.
    <html lang="en" className={cn("dark h-full", codecPro.variable)}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
