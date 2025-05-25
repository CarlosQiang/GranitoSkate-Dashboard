import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Package,
  Search,
  AlertTriangle,
  UserCog,
  Palette,
  Layers,
  ShoppingCart,
  Tag,
  BarChart,
  Activity,
  Wrench,
  Globe,
  RefreshCw,
} from "lucide-react"

// Navegación principal completa con Shopify
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
    icon: Layers,
  },
  {
    name: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Promociones",
    href: "/dashboard/promociones",
    icon: Tag,
  },
  {
    name: "SEO",
    href: "/dashboard/seo",
    icon: Search,
  },
  {
    name: "Mercados",
    href: "/dashboard/seo-markets",
    icon: Globe,
  },
  {
    name: "Analíticas",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    name: "Contenido",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    name: "Sincronización",
    href: "/dashboard/sincronizacion",
    icon: RefreshCw,
  },
  {
    name: "Registros",
    href: "/dashboard/registros",
    icon: Activity,
  },
  {
    name: "Administradores",
    href: "/dashboard/administradores",
    icon: UserCog,
  },
  {
    name: "Personalización",
    href: "/dashboard/personalizacion",
    icon: Palette,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Diagnóstico",
    href: "/dashboard/diagnostics",
    icon: AlertTriangle,
  },
  {
    name: "Setup",
    href: "/dashboard/setup",
    icon: Wrench,
  },
]

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
    icon: Layers,
    color: "text-pink-500",
  },
  {
    title: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
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
    href: "/dashboard/promociones",
    icon: Tag,
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
    icon: BarChart,
    color: "text-indigo-500",
  },
]

export const settingsNav = [
  {
    title: "Sincronización",
    href: "/dashboard/sincronizacion",
    icon: RefreshCw,
    color: "text-blue-500",
  },
  {
    title: "Registros",
    href: "/dashboard/registros",
    icon: Activity,
    color: "text-green-500",
  },
  {
    title: "Personalización",
    href: "/dashboard/personalizacion",
    icon: Palette,
    color: "text-purple-500",
  },
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
  {
    title: "Administradores",
    href: "/dashboard/administradores",
    icon: UserCog,
    color: "text-granito",
  },
  {
    title: "Setup",
    href: "/dashboard/setup",
    icon: Wrench,
    color: "text-blue-500",
  },
]

export const dashboardConfig = {
  mainNav: [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: "home",
    },
    {
      title: "Productos",
      href: "/dashboard/products",
      icon: "package",
    },
    {
      title: "Colecciones",
      href: "/dashboard/collections",
      icon: "layers",
    },
    {
      title: "Clientes",
      href: "/dashboard/customers",
      icon: "users",
    },
    {
      title: "Pedidos",
      href: "/dashboard/orders",
      icon: "shopping-cart",
    },
    {
      title: "Promociones",
      href: "/dashboard/promociones",
      icon: "tag",
    },
    {
      title: "Contenido",
      href: "/dashboard/content",
      icon: "file-text",
    },
    {
      title: "SEO",
      href: "/dashboard/seo",
      icon: "search",
    },
    {
      title: "Mercados",
      href: "/dashboard/seo-markets",
      icon: "globe",
    },
    {
      title: "Analítica",
      href: "/dashboard/analytics",
      icon: "bar-chart",
    },
    {
      title: "Sincronización",
      href: "/dashboard/sincronizacion",
      icon: "refresh-cw",
    },
    {
      title: "Registros",
      href: "/dashboard/registros",
      icon: "activity",
    },
    {
      title: "Diagnósticos",
      href: "/dashboard/diagnostics",
      icon: "activity",
    },
    {
      title: "Administradores",
      href: "/dashboard/administradores",
      icon: "shield",
    },
    {
      title: "Personalización",
      href: "/dashboard/personalizacion",
      icon: "palette",
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
