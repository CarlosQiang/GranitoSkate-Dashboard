"use client"

import { LogoutButton } from "@/components/logout-button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 transition-all">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md granito-gradient flex items-center justify-center md:hidden">
          <span className="text-white font-bold">G</span>
        </div>
        <h1 className="text-lg font-semibold hidden md:block">GestionGranito</h1>
        <h1 className="text-lg font-semibold md:hidden">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <LogoutButton variant="ghost" className="hidden md:flex" />
        <LogoutButton variant="ghost" iconOnly className="md:hidden" />
      </div>
    </header>
  )
}
