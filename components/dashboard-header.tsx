"use client"

import { LogoutButton } from "@/components/logout-button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">GestionGranito</h1>
      </div>
      <div className="flex items-center gap-4">
        <LogoutButton variant="ghost" className="hidden md:flex" />
        <LogoutButton variant="ghost" iconOnly className="md:hidden" />
      </div>
    </header>
  )
}
