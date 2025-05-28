"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="main-layout">
      <DashboardNav />
      <div className="main-content">
        {/* Header móvil */}
        {isMobile && <DashboardHeader />}

        {/* Contenido principal */}
        <main
          className={cn("min-h-screen bg-gray-50/50 dark:bg-gray-900/50", "transition-all duration-300 ease-in-out")}
        >
          <div className="container-responsive page-container">{children}</div>
        </main>
      </div>
    </div>
  )
}
