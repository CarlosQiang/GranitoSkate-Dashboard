"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, ChevronRight, ChevronLeft } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

export function DashboardNav() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  const toggleCollapse = () => {
    if (isMobile) return // No colapsar en móvil

    setIsCollapsed(!isCollapsed)
    localStorage.setItem("navCollapsed", String(!isCollapsed))

    if (!isCollapsed) {
      document.documentElement.classList.add("sidebar-collapsed")
    } else {
      document.documentElement.classList.remove("sidebar-collapsed")
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Cargar preferencia de colapso del menú (solo desktop)
  useEffect(() => {
    if (!isMobile) {
      const savedCollapsed = localStorage.getItem("navCollapsed")
      if (savedCollapsed !== null) {
        const collapsed = savedCollapsed === "true"
        setIsCollapsed(collapsed)
        if (collapsed) {
          document.documentElement.classList.add("sidebar-collapsed")
        } else {
          document.documentElement.classList.remove("sidebar-collapsed")
        }
      }
    }
  }, [isMobile])

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

  // Prevenir scroll cuando el menú está abierto en móvil
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMenuOpen, isMobile])

  const activeItemStyle = {
    backgroundColor: theme.primaryColor,
    color: "#ffffff",
  }

  const logoutButtonStyle = {
    color: "#ef4444",
    borderColor: "#ef4444",
  }

  return (
    <>
      {/* Botón de menú móvil */}
      <Button
        id="mobile-menu-button"
        variant="ghost"
        className={cn(
          "fixed top-4 right-4 z-50 transition-all duration-200",
          "bg-background/80 backdrop-blur-sm border shadow-sm",
          "md:hidden",
        )}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Navegación principal */}
      <nav
        id="mobile-nav"
        className={cn(
          "sidebar",
          "flex flex-col bg-white dark:bg-gray-900 border-r shadow-sm",
          "transition-all duration-300 ease-in-out",
          // Móvil
          isMobile && ["fixed top-0 left-0 h-full z-40 w-72", isMenuOpen ? "translate-x-0" : "-translate-x-full"],
          // Desktop
          !isMobile && ["fixed top-0 left-0 h-full z-40", isCollapsed ? "w-16" : "w-64"],
        )}
      >
        {/* Header del sidebar */}
        <div
          className={cn(
            "flex items-center border-b p-4",
            isMobile ? "pt-16" : "pt-4",
            isCollapsed && !isMobile && "justify-center px-2",
          )}
        >
          <div
            className="h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span className="text-white font-bold text-lg">G</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="ml-3">
              <span className="font-bold text-lg">{theme.shopName || "GranitoSkate"}</span>
              <p className="text-xs text-muted-foreground">Panel de administración</p>
            </div>
          )}
        </div>

        {/* Botón para colapsar/expandir (solo desktop) */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "absolute -right-3 top-20 bg-white dark:bg-gray-800 border rounded-full h-6 w-6 shadow-md",
              "flex items-center justify-center transition-all duration-200",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
            )}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                    isCollapsed && !isMobile && "justify-center px-2 tooltip-trigger",
                  )}
                  style={isActive ? activeItemStyle : {}}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && !isMobile && "h-6 w-6")} />
                  {(!isCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
                  {isActive && (!isCollapsed || isMobile) && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white/80" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer del sidebar */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20",
              "transition-colors duration-200",
              isCollapsed && !isMobile && "px-2 justify-center",
            )}
            style={logoutButtonStyle}
            onClick={handleLogout}
            title={isCollapsed && !isMobile ? "Cerrar sesión" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span>Cerrar sesión</span>}
          </Button>
        </div>
      </nav>

      {/* Overlay para móvil */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm fade-in"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}
