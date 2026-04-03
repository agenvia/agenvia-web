import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const heading = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = constructMetadata({});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={{ formFieldLabel__emailAddress: "Email (dashboard user)" }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            heading.variable,
            body.variable,
            "min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-body"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
