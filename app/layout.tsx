import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GranitoSkate Dashboard",
  description: "Panel de administración para GranitoSkate",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}


import './globals.css'