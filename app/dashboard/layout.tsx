import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeProvider } from "@/contexts/theme-context"
import { DynamicHead } from "@/components/dynamic-head"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DynamicHead />
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 ease-in-out">
          <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  )
}
