import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Granito Management app - Panel de Administración",
  description: "Panel de administración para la tienda Granito Management app",
  icons: {
    icon: "/favicon-granito.ico",
    shortcut: "/favicon-granito.ico",
    apple: "/favicon-granito.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon-granito.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon-granito.ico" />
        <link rel="apple-touch-icon" href="/favicon-granito.ico" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
