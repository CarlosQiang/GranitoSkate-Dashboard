import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AutoSync } from "@/components/auto-sync"

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
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardNav />
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            <DashboardLayoutWrapper>
              <AutoSync />
              <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
            </DashboardLayoutWrapper>
          </div>
        </main>
      </div>
    </div>
  )
}
