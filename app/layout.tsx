import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { NextAuthProvider } from "@/components/session-provider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GranitoSkate - Panel de Administración",
  description: "Panel de administración para la tienda GranitoSkate",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider session={session}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
