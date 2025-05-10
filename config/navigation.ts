export type NavItem = {
  title: string
  href: string
  icon?: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: string
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavItem[]
    }
)

interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Soporte",
      href: "https://granito.com/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
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
      href: "/dashboard/promotions",
      icon: "tag",
    },
    {
      title: "SEO",
      href: "/dashboard/seo",
      icon: "search",
    },
    {
      title: "Mercados SEO",
      href: "/dashboard/seo-markets",
      icon: "globe",
    },
    {
      title: "Contenido",
      href: "/dashboard/content",
      icon: "file-text",
    },
    {
      title: "Analíticas",
      href: "/dashboard/analytics",
      icon: "bar-chart",
    },
    {
      title: "Diagnósticos",
      href: "/dashboard/diagnostics",
      icon: "activity",
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
