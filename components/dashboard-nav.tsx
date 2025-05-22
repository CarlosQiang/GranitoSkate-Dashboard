import { Home, LayoutDashboard, ShoppingBag, Settings, AlertTriangle } from "lucide-react"

import { NavItem } from "@/components/nav-item"

interface DashboardNavProps {
  isCollapsed: boolean
}

export function DashboardNav({ isCollapsed }: DashboardNavProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="border-b">
        <div className="flex flex-col gap-y-4 px-3 py-2">
          <NavItem isCollapsed={isCollapsed} href="/dashboard" title="Inicio" icon={<Home className="h-4 w-4" />} />
          <NavItem
            isCollapsed={isCollapsed}
            href="/dashboard/layout"
            title="Layout"
            icon={<LayoutDashboard className="h-4 w-4" />}
          />
          <NavItem
            isCollapsed={isCollapsed}
            href="/dashboard/settings"
            title="Ajustes"
            icon={<Settings className="h-4 w-4" />}
          />
        </div>
      </div>
      <div className="border-b">
        <div className="flex flex-col gap-y-4 px-3 py-2">
          <NavItem
            isCollapsed={isCollapsed}
            href="/dashboard/diagnostics"
            title="Diagnóstico"
            icon={<AlertTriangle className="h-4 w-4" />}
            variant="ghost"
          />
          <NavItem
            isCollapsed={isCollapsed}
            href="/dashboard/diagnostics/shopify"
            title="Diagnóstico Shopify"
            icon={<ShoppingBag className="h-4 w-4" />}
            variant="ghost"
          />
        </div>
      </div>
    </div>
  )
}
