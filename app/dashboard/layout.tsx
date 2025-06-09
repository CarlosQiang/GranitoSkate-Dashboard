import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeProvider } from "@/contexts/theme-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="main-layout flex flex-col min-h-screen w-full overflow-hidden">
        <DashboardNav />
        <main className="main-content flex-1 w-full overflow-x-hidden">{children}</main>
      </div>
    </ThemeProvider>
  )
}
