import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeProvider } from "@/contexts/theme-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ThemeProvider>
  )
}
