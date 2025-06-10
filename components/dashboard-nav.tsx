"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, LogOut, ChevronRight, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"

export function DashboardNav() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    localStorage.setItem("navCollapsed", String(!isCollapsed))
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Cargar preferencia de colapso del menú
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("navCollapsed")
    if (savedCollapsed !== null) {
      const collapsed = savedCollapsed === "true"
      setIsCollapsed(collapsed)
    }
  }, [])

  // Cerrar el menú cuando se hace clic en un enlace y se cambia de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

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

  // Estilo dinámico para el color de fondo del elemento activo
  const activeItemStyle = {
    backgroundColor: theme.primaryColor || "#c7a04a",
    color: "#ffffff",
  }

  return (
    <>
      {/* Botón de menú móvil */}
      <Button
        variant="ghost"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay para móvil */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Navegación lateral */}
      <nav
        className={cn(
          // Estilos base
          "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50",
          // Ancho fijo para escritorio
          "w-64",
          // Comportamiento móvil
          "transform transition-transform duration-300 ease-in-out md:transform-none",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Estado colapsado (solo escritorio)
          isCollapsed && "md:w-16",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header con logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Botón cerrar en móvil */}
            <Button
              variant="ghost"
              className="md:hidden absolute top-4 right-4 p-1"
              onClick={closeMenu}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start">
              {isCollapsed ? (
                <div className="hidden md:flex h-8 w-8 items-center justify-center">
                  <Image src="/logo-granito-management.png" alt="" width={24} height={24} className="rounded" />
                </div>
              ) : (
                <div className="w-full max-w-[200px]">
                  <Image
                    src="/logo-granito-completo.png"
                    alt="Granito Management App"
                    width={200}
                    height={45}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botón colapsar (solo escritorio) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full h-6 w-6 shadow-md hover:shadow-lg transition-shadow"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <ChevronRight
              className={cn("h-3 w-3 text-gray-500 transition-transform duration-200", isCollapsed ? "rotate-180" : "")}
            />
          </button>

          {/* Navegación */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isCollapsed && "md:justify-center md:px-2",
                    )}
                    style={isActive ? activeItemStyle : {}}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer con logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className={cn(
                "w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20",
                isCollapsed && "md:p-2",
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Cerrar sesión</span>}
            </Button>
          </div>
        </div>
      </nav>
    </>
  )
}
