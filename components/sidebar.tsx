"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Users, ShoppingCart, FolderKanban } from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Productos",
      icon: Package,
      href: "/dashboard/productos",
      active: pathname.includes("/dashboard/productos"),
    },
    {
      label: "Colecciones",
      icon: FolderKanban,
      href: "/dashboard/colecciones",
      active: pathname.includes("/dashboard/colecciones"),
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/dashboard/clientes",
      active: pathname.includes("/dashboard/clientes"),
    },
    {
      label: "Pedidos",
      icon: ShoppingCart,
      href: "/dashboard/pedidos",
      active: pathname.includes("/dashboard/pedidos"),
    },
  ]

  return (
    <nav className={cn("hidden md:block md:w-64 lg:w-72 px-3 py-4", className)}>
      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
              route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <route.icon className="mr-3 h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
