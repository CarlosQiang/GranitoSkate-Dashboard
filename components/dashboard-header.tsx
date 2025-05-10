"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, Bell, Settings, User } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Rutas principales del dashboard
  const mainRoutes = [
    { href: "/dashboard/products", label: "Productos" },
    { href: "/dashboard/collections", label: "Colecciones" },
    { href: "/dashboard/orders", label: "Pedidos" },
    { href: "/dashboard/customers", label: "Clientes" },
    { href: "/dashboard/seo", label: "SEO" },
    { href: "/dashboard/promotions", label: "Promociones" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Granito Skate</span>
          </Link>
        </div>

        <nav
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } absolute top-16 left-0 z-20 w-full border-b bg-background p-4 transition-all duration-300 ease-in-out md:static md:block md:w-auto md:border-0 md:p-0`}
        >
          <ul className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-8 md:space-y-0">
            {mainRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith(route.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {route.label}
                </Link>
              </li>
            ))}
            <li className="md:hidden">
              <Link
                href="/dashboard/settings"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname?.startsWith("/dashboard/settings") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Configuración
              </Link>
            </li>
            <li className="md:hidden">
              <LogoutButton />
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ShopifyConnectionStatus className="hidden md:flex" />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Configuración</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
