"use client"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  Settings,
  Home,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { NavItem } from "@/components/nav-item"

export function DashboardNav() {
  const { theme } = useTheme()
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
    // Actualizar clase en el documento para el layout
    if (!isCollapsed) {
      document.documentElement.classList.add("sidebar-collapsed")
    } else {
      document.documentElement.classList.remove("sidebar-collapsed")
    }
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
      if (collapsed) {
        document.documentElement.classList.add("sidebar-collapsed")
      } else {
        document.documentElement.classList.remove("sidebar-collapsed")
      }
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
          "sidebar",
          "flex flex-col border-r bg-white dark:bg-gray-900 shadow-sm",
          "fixed top-0 left-0 h-full z-40",
          "transform transition-all duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed && "sidebar-collapsed",
        )}
      >
        <div className="flex flex-col gap-1 p-4 pt-16 md:pt-4 overflow-y-auto hide-scrollbar h-full">
          {/* Logo o título en la parte superior del menú */}
          <div className="mb-6 flex items-center justify-center md:justify-start">
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center mr-2 flex-shrink-0"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <span className="text-white font-bold text-lg">G</span>
            </div>
            {!isCollapsed && <span className="font-bold text-lg">{theme.shopName || "GranitoSkate"}</span>}
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

          <NavItem href="/dashboard" title="Dashboard" icon={<Home className="h-5 w-5" />} isCollapsed={isCollapsed} />

          <NavItem
            href="/dashboard/products"
            title="Productos"
            icon={<Package className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/dashboard/customers"
            title="Clientes"
            icon={<Users className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/dashboard/orders"
            title="Pedidos"
            icon={<ShoppingCart className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/dashboard/diagnostics"
            title="Diagnóstico"
            icon={<AlertTriangle className="h-5 w-5" />}
            isCollapsed={isCollapsed}
            variant="ghost"
          />

          <NavItem
            href="/dashboard/diagnostics/shopify"
            title="Diagnóstico Shopify"
            icon={<ShoppingBag className="h-5 w-5" />}
            isCollapsed={isCollapsed}
            variant="ghost"
          />

          <NavItem
            href="/dashboard/settings"
            title="Configuración"
            icon={<Settings className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Botón de logout con estilo mejorado */}
        <div className="p-4 mt-auto border-t">
          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20",
              isCollapsed && "md:p-2",
            )}
            style={{ color: "#ef4444", borderColor: "#ef4444" }}
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
