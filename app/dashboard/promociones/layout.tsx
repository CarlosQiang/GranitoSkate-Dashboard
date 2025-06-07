import type React from "react"
export const dynamic = "force-dynamic"
export const revalidate = 60

export default function PromocionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
