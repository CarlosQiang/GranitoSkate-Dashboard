"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"
import { Button } from "@/components/ui/button"

export function DashboardNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      {/* Botón de menú móvil */}
      <Button
        variant="ghost"
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Navegación para escritorio */}
      <nav
        className={cn(
          "w-full md:w-64 flex-col border-r bg-muted/40",
          "fixed md:sticky top-0 left-0 h-full z-40",
          "transform transition-transform duration-300 ease-in-out",
          "md:transform-none md:opacity-100 md:pointer-events-auto",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col gap-1 p-4 pt-16 md:pt-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Overlay para cerrar el menú en móvil */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={toggleMenu} aria-hidden="true" />
      )}
    </>
  )
}
