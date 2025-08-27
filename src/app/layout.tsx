import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyTracker - Personal Finance Management",
  description: "Track expenses, manage debts, and split group expenses with ease",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneyTracker",
  },
  openGraph: {
    title: "MoneyTracker - Personal Finance Management",
    description: "Track expenses, manage debts, and split group expenses with ease",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            {children}
            <InstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
