import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { ShopifyConnectionChecker } from "@/components/shopify-connection-checker"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"

export const metadata: Metadata = {
  title: "Dashboard - GranitoSkate",
  description: "Panel de administración para la tienda GranitoSkate",
}

async function inicializarAplicacion() {
  try {
    // Solo ejecutar en el servidor durante la construcción o en desarrollo
    if (typeof window === "undefined") {
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

      const response = await fetch(`${baseUrl}/api/init`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        console.error("Error al inicializar la aplicación:", response.statusText)
      }
    }
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error)
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await inicializarAplicacion()
  return (
    <DashboardLayoutWrapper>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1 flex-col md:flex-row">
          <DashboardNav />
          <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
            <ShopifyConnectionChecker />
            {children}
          </main>
        </div>
      </div>
    </DashboardLayoutWrapper>
  )
}
