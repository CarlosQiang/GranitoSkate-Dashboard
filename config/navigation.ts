import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText,
  Settings,
  Package,
  Percent,
  Globe,
  Search,
  AlertTriangle,
} from "lucide-react"

// Exportamos navigationItems para mantener compatibilidad con el código existente
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
  },
  {
    name: "SEO",
    href: "/dashboard/seo",
    icon: Search,
    isNew: true,
  },
  {
    name: "Mercados",
    href: "/dashboard/seo-markets",
    icon: Globe,
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
  // Comentamos la sección de analíticas para evitar problemas
  // {
  //   name: "Analíticas",
  //   href: "/dashboard/analytics",
  //   icon: BarChart3,
  // },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Monitorización SEO",
    href: "/dashboard/seo/monitoring",
    icon: "barChart2",
    description: "Monitoriza el rendimiento SEO de tu tienda",
  },
]

// Exportamos también las nuevas estructuras de navegación
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
    icon: Package,
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
  // Comentamos la sección de analíticas para evitar problemas
  // {
  //   title: "Analíticas",
  //   href: "/dashboard/analytics",
  //   icon: BarChart3,
  //   color: "text-indigo-500",
  // },
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

// Exportar navigationConfig para el dashboard-nav.tsx
export const navigationConfig = {
  mainNav,
  settingsNav,
}
