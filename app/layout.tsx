import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

// Generar metadatos dinámicos basados en la configuración del tema
export async function generateMetadata(): Promise<Metadata> {
  let shopName = "Granito Management app"

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/theme/public-config`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
      cache: "force-cache",
    })

    if (res.ok) {
      const data = await res.json()
      shopName = data.shopName || shopName
    }
  } catch (error) {
    console.error("Error al obtener el nombre de la tienda:", error)
  }

  return {
    title: `${shopName} - Panel de Administración`,
    description: `Panel de administración personalizado para ${shopName}`,
    icons: {
      icon: "/favicon-granito.ico",
      shortcut: "/favicon-granito.ico",
      apple: "/favicon-granito.ico",
    },
  }
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

export const metadata = {
      generator: 'v0.dev'
    };
