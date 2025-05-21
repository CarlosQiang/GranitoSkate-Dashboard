"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    // Guardar preferencia en localStorage
    localStorage.setItem("navCollapsed", String(!isCollapsed))
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Cargar preferencia de colapso del menú
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("navCollapsed")
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === "true")
    }
  }, [])

  // Cerrar el menú cuando se hace clic en un enlace y se cambia de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById("mobile-nav")
      if (nav && !nav.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  // Prevenir scroll cuando el menú está abierto en móvil
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Botón de menú móvil con animación mejorada */}
      <Button
        variant="ghost"
        className="md:hidden fixed top-4 right-4 z-50 transition-all duration-200 bg-background/80 backdrop-blur-sm"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Navegación para escritorio y móvil con animaciones mejoradas */}
      <nav
        id="mobile-nav"
        className={cn(
          "w-full md:w-64 flex-col border-r bg-white dark:bg-gray-900 shadow-sm",
          "fixed md:sticky top-0 left-0 h-full z-40",
          "transform transition-all duration-300 ease-in-out",
          "md:transform-none md:opacity-100 md:pointer-events-auto",
          "flex flex-col justify-between",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed && "md:w-20",
        )}
      >
        <div className="flex flex-col gap-1 p-4 pt-16 md:pt-4 overflow-y-auto hide-scrollbar">
          {/* Logo o título en la parte superior del menú */}
          <div className="mb-6 flex items-center justify-center md:justify-start">
            <div className="h-10 w-10 rounded-md bg-granito-500 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            {!isCollapsed && <span className="font-bold text-lg">GranitoSkate</span>}
          </div>

          {/* Botón para colapsar/expandir el menú (solo en escritorio) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center absolute -right-3 top-20 bg-white dark:bg-gray-800 border rounded-full h-6 w-6 shadow-md"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronRight
              className={cn("h-4 w-4 text-gray-500 transition-transform", isCollapsed ? "rotate-180" : "")}
            />
          </button>

          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-granito-500 text-white"
                  : "text-gray-700 dark:text-gray-300",
                isCollapsed && "md:justify-center md:px-2",
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "md:h-6 md:w-6")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* Botón de logout con estilo mejorado */}
        <div className="p-4 mt-auto border-t">
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
              isCollapsed && "md:p-2",
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </Button>
        </div>
      </nav>

      {/* Overlay para cerrar el menú en móvil con animación de fade */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm fade-in"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}
