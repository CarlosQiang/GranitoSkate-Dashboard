import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeProvider } from "@/contexts/theme-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="main-layout">
        <DashboardNav />
        <main className="main-content p-4 md:p-6">{children}</main>
      </div>
    </ThemeProvider>
  )
}
