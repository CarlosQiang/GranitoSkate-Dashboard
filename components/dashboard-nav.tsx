import { Cog, Home, List, Plus, ShoppingCart, User, Users } from "lucide-react"

import { Icons } from "@/components/icons"

export const dashboardNavItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Ventas",
    href: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    title: "Productos",
    href: "/dashboard/products",
    icon: List,
  },
  {
    title: "Crear Producto",
    href: "/dashboard/products/create",
    icon: Plus,
  },
  {
    title: "Categorias",
    href: "/dashboard/categories",
    icon: Icons.category,
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Ajustes",
    href: "/dashboard/settings",
    icon: Cog,
  },
]
