import { LayoutDashboard, Settings, AlertTriangle, UserCog, Activity, Wrench } from "lucide-react"

// Navegación limpia - solo rutas que funcionan
export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    title: "Registros",
    href: "/dashboard/registros",
    icon: Activity,
    color: "text-green-500",
  },
  {
    title: "Administradores",
    href: "/dashboard/administradores",
    icon: UserCog,
    color: "text-granito",
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
    title: "Setup",
    href: "/dashboard/setup",
    icon: Wrench,
    color: "text-blue-500",
  },
]

// Configuración simplificada del dashboard
export const dashboardConfig = {
  mainNav: [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: "home",
    },
    {
      title: "Registros",
      href: "/dashboard/registros",
      icon: "activity",
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
    {
      title: "Diagnósticos",
      href: "/dashboard/diagnostics",
      icon: "activity",
    },
    {
      title: "Setup",
      href: "/dashboard/setup",
      icon: "wrench",
    },
  ],
}
