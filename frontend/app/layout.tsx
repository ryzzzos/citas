import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionOnboardingGuard from "@/components/auth/SessionOnboardingGuard";
import Navbar from "@/components/layout/Navbar";
import ThemeProvider from "@/components/theme/ThemeProvider";
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
  title: "Agenda Web — Reserva tu cita online",
  description: "Plataforma de gestión de agenda y reservas para negocios de servicios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="agenda-web-theme"
        >
          <SessionOnboardingGuard />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
