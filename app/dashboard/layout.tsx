import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeProvider } from "@/contexts/theme-context"
import { DynamicHead } from "@/components/dynamic-head"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DynamicHead />
      <div className="main-layout">
        <DashboardNav />
        <main className="main-content p-4 md:p-6">{children}</main>
      </div>
    </ThemeProvider>
  )
}
