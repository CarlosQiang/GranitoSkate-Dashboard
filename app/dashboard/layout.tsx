"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // En móvil, siempre colapsado
      if (mobile) {
        setIsCollapsed(true)
      } else {
        // En desktop, usar preferencia guardada
        const saved = localStorage.getItem("sidebarCollapsed")
        setIsCollapsed(saved === "true")
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Contenido principal */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Desktop
          "lg:ml-64",
          // Mobile
          "ml-0",
        )}
      >
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
