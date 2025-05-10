"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationConfig } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-6">
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Panel de Control</h2>
        <div className="space-y-1">
          {navigationConfig.mainNav
            .filter((item) => item.href !== "/dashboard/analytics") // Filtrar la página de analytics
            .map((item, index) => (
              <Button
                key={index}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              </Button>
            ))}
        </div>
      </div>
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Configuración</h2>
        <div className="space-y-1">
          {navigationConfig.settingsNav.map((item, index) => (
            <Button
              key={index}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
