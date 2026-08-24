import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
    <html lang="en" className={`${codecPro.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
