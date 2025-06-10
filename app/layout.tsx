import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Agregar metadatos dinámicos para el nombre de la tienda
export async function generateMetadata() {
  let shopName = "Granito Management app"

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/theme/public-config`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    })

    if (res.ok) {
      const data = await res.json()
      shopName = data.shopName
    }
  } catch (error) {
    console.error("Error al obtener el nombre de la tienda:", error)
  }

  return {
    title: `${shopName} - Panel de Administración`,
    description: `Panel de administración personalizado para ${shopName}`,
  }
}

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
