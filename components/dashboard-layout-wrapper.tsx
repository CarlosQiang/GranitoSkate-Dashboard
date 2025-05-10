"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardLayoutWrapperProps {
  children: React.ReactNode
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Cerrar la barra lateral en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-40 w-full border-b bg-background h-16"></div>
        <div className="flex flex-1">
          <div className="hidden md:block w-64 border-r bg-background">
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-40 mx-4" />
              <div className="px-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          </div>
          <main className="flex-1 p-4 md:p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-background pt-16 transition-transform duration-300 md:static md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <DashboardNav />
        </div>
        {isSidebarOpen && isMobile && (
          <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <main className={cn("flex-1 overflow-auto p-4 md:p-8", isSidebarOpen && !isMobile ? "md:ml-64" : "")}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
