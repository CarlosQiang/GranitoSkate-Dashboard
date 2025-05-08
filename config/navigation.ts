export type NavigationItem = {
  title: string
  href: string
  icon?: string
  disabled?: boolean
}

export type NavigationSection = {
  title: string
  items: NavigationItem[]
}

export const navigationConfig: NavigationSection[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
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
        title: "Productos",
        href: "/dashboard/products",
        icon: "package",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Campañas",
        href: "/dashboard/marketing/campaigns",
        icon: "megaphone",
      },
      {
        title: "SEO",
        href: "/dashboard/seo",
        icon: "search",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configuración",
        href: "/dashboard/settings",
        icon: "settings",
      },
      {
        title: "Diagnósticos",
        href: "/dashboard/system-diagnostics",
        icon: "activity",
      },
    ],
  },
]
