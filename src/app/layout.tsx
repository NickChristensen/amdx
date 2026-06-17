import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist_Mono, Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AMDX",
  description: "Lazy MDX rendering for agent-written reports.",
};

const themeScript = `
(() => {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (isDark) => {
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  };

  applyTheme(media.matches);

  const handleChange = (event) => applyTheme(event.matches);

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleChange);
  } else {
    media.addListener(handleChange);
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-screen bg-background",
        "font-sans",
        inter.variable,
        geistMono.variable,
        outfitHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-sync" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
