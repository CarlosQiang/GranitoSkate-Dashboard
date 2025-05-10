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
          className={`${isMobileMenuOpen ? "block" : "hidden"} absolute top-16 left-0 w-full bg-background border-b p-4 md:static md:block md:w-auto md:border-0 md:p-0 transition-all duration-300 ease-in-out`}
        >
          <ul className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-8 md:space-y-0">
            <li>
              <Link
                href="/dashboard/products"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/products") ? "text-primary" : "text-muted-foreground"}`}
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/collections"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/collections") ? "text-primary" : "text-muted-foreground"}`}
              >
                Colecciones
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/orders"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/orders") ? "text-primary" : "text-muted-foreground"}`}
              >
                Pedidos
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/customers"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/customers") ? "text-primary" : "text-muted-foreground"}`}
              >
                Clientes
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/seo"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/seo") ? "text-primary" : "text-muted-foreground"}`}
              >
                SEO
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/promotions"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/promotions") ? "text-primary" : "text-muted-foreground"}`}
              >
                Promociones
              </Link>
            </li>
            <li className="md:hidden">
              <Link
                href="/dashboard/settings"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.startsWith("/dashboard/settings") ? "text-primary" : "text-muted-foreground"}`}
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
              <Link href="/dashboard/notifications">
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
              <Link href="/dashboard/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
