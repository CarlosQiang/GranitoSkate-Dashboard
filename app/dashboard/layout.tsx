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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
