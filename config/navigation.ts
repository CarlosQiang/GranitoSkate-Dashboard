import { LayoutDashboard, Package, Users, ShoppingCart, Tags, Settings, FileText, BarChart } from "lucide-react"

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Colecciones",
    href: "/dashboard/collections",
    icon: Tags,
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Contenido",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    name: "Estadísticas",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]
