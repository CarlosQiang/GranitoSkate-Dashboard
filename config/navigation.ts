import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Users,
  Package,
  Settings,
  BarChart3,
  FileText,
  Globe,
  Search,
  Percent,
  AlertTriangle,
} from "lucide-react"

export const mainNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-sky-500",
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: Package,
    color: "text-violet-500",
  },
  {
    title: "Colecciones",
    href: "/dashboard/collections",
    icon: Tag,
    color: "text-pink-500",
  },
  {
    title: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingBag,
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
  {
    title: "Mercados",
    href: "/dashboard/seo-markets",
    icon: Globe,
    color: "text-green-500",
  },
  {
    title: "Contenido",
    href: "/dashboard/content",
    icon: FileText,
    color: "text-purple-500",
  },
  {
    title: "Analíticas",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "text-indigo-500",
  },
]

export const settingsNav = [
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
