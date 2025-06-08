import type React from "react"
import { requireAuth } from "@/lib/auth-check"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación para todas las páginas del dashboard
  const session = await requireAuth()

  return (
    // Contenido del layout
    <div>{children}</div>
  )
}
