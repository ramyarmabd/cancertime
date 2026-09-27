import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CancerTime | Cancer Care Time Calculator",
    template: "%s | CancerTime",
  },
  description: "Estimate the time spent traveling to, receiving, and supporting cancer care.",
  openGraph: {
    title: "CancerTime | Cancer Care Time Calculator",
    description: "Estimate the time spent traveling to, receiving, and supporting cancer care.",
    type: "website",
    siteName: "CancerTime",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eae0" },
    { media: "(prefers-color-scheme: dark)", color: "#16131c" },
  ],
};

const themeInitializer = `
  (function () {
    try {
      var savedTheme = localStorage.getItem("cancertime-theme");
      var theme = savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="sr-only z-50 bg-surface px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
