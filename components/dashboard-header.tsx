"use client"

import { LogoutButton } from "@/components/logout-button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 transition-all">
      <div className="flex items-center gap-3">
        <img src="/images/granito-logo.png" alt="Granito Management App" className="h-12 w-auto md:h-14" />
        <h1 className="text-lg font-semibold hidden lg:block">Panel de Administración</h1>
      </div>
      <div className="flex items-center gap-4">
        <LogoutButton variant="ghost" className="hidden md:flex" />
        <LogoutButton variant="ghost" iconOnly className="md:hidden" />
      </div>
    </header>
  )
}
