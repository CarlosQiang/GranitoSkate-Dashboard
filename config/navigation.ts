import { LayoutDashboard, ShoppingBag, Users, FileText, Settings, Package, BarChart3, Percent } from "lucide-react"

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    name: "Colecciones",
    href: "/dashboard/collections",
    icon: Package,
  },
  {
    name: "Promociones",
    href: "/dashboard/promotions",
    icon: Percent,
    isNew: true,
  },
  {
    name: "Pedidos",
    href: "/dashboard/orders",
    icon: FileText,
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Analíticas",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]
