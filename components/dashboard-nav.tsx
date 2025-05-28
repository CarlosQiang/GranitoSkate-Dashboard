"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Cerrar el menú cuando se hace clic en un enlace
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Cerrar el menú cuando se hace clic fuera de él (solo móvil)
  useEffect(() => {
    if (!isMobile) return

    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById("mobile-nav")
      const button = document.getElementById("mobile-menu-button")

      if (
        nav &&
        !nav.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen, isMobile])

  return (
    <>
      {/* Botón de menú móvil */}
      {isMobile && (
        <Button
          id="mobile-menu-button"
          variant="ghost"
          className="fixed top-4 left-4 z-50 bg-white shadow-md border lg:hidden"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Overlay para móvil */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleMenu} aria-hidden="true" />
      )}

      {/* Navegación principal */}
      <nav
        id="mobile-nav"
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-900 border-r shadow-lg",
          "flex flex-col transition-transform duration-300 ease-in-out",
          // Desktop: siempre visible
          "lg:translate-x-0 lg:w-64",
          // Mobile: deslizable
          isMobile && ["w-72", isMenuOpen ? "translate-x-0" : "-translate-x-full"],
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center border-b p-4">
          <div className="h-10 w-10 rounded-md bg-yellow-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div className="ml-3">
            <span className="font-bold text-lg">GranitoSkate</span>
            <p className="text-xs text-muted-foreground">Panel de administración</p>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive && "bg-yellow-600 text-white hover:bg-yellow-700",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white/80" />}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer del sidebar */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </nav>
    </>
  )
}
