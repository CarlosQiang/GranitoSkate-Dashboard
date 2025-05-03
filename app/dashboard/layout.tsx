import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { ShopifyConnectionChecker } from "@/components/shopify-connection-checker"
import { DashboardErrorBoundary } from "@/components/dashboard-error-boundary"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutWrapper>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
          <aside className="hidden w-[200px] flex-col md:flex">
            <DashboardNav />
          </aside>
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            <ShopifyConnectionChecker />
            <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
          </main>
        </div>
      </div>
    </DashboardLayoutWrapper>
  )
}
