import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText,
  Settings,
  Package,
  BarChart3,
  Percent,
  Search,
  AlertTriangle,
  UserCog,
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
  },
  // {
  //   name: "Mercados",
  //   href: "/dashboard/seo-markets",
  //   icon: Globe,
  // },
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
  {
    name: "Administradores",
    href: "/dashboard/administradores",
    icon: UserCog,
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
  // {
  //   title: "Mercados",
  //   href: "/dashboard/seo-markets",
  //   icon: Globe,
  //   color: "text-green-500",
  // },
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
  {
    title: "Administradores",
    href: "/dashboard/administradores",
    icon: UserCog,
    color: "text-granito",
  },
]

// Añadir la sección de sincronización al menú de navegación
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
    // {
    //   title: "Mercados",
    //   href: "/dashboard/seo-markets",
    //   icon: "globe",
    // },
    {
      title: "Analítica",
      href: "/dashboard/analytics",
      icon: "bar-chart",
    },
    {
      title: "Diagnósticos",
      href: "/dashboard/diagnostics",
      icon: "activity",
    },
    {
      title: "Sincronización",
      href: "/dashboard/sincronizacion",
      icon: "refresh-cw",
    },
    {
      title: "Administradores",
      href: "/dashboard/administradores",
      icon: "shield",
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
