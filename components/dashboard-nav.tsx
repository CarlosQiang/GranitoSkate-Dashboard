"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  Users,
  Search,
  Percent,
  Settings,
  AlertTriangle,
} from "lucide-react"

// Configuración de navegación
const mainNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500",
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: ShoppingBag,
    color: "text-violet-500",
  },
  {
    title: "Colecciones",
    href: "/dashboard/collections",
    icon: Package,
    color: "text-pink-500",
  },
  {
    title: "Pedidos",
    href: "/dashboard/orders",
    icon: FileText,
    color: "text-orange-500",
  },
  {
    title: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
    color: "text-emerald-500",
  },
  {
    title: "Promociones",
    href: "/dashboard/promotions",
    icon: Percent,
    color: "text-yellow-500",
  },
  {
    title: "SEO",
    href: "/dashboard/seo",
    icon: Search,
    color: "text-blue-500",
  },
]

const settingsNav = [
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500",
  },
  {
    title: "Diagnóstico",
    href: "/dashboard/diagnostics",
    icon: AlertTriangle,
    color: "text-amber-500",
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-6">
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Panel de Control</h2>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href || pathname?.startsWith(item.href + "/") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className={`mr-2 h-4 w-4 ${item.color}`} />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Configuración</h2>
        <div className="space-y-1">
          {settingsNav.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href || pathname?.startsWith(item.href + "/") ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className={`mr-2 h-4 w-4 ${item.color}`} />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
