"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { navigationConfig } from "@/config/navigation"
import { LogoutButton } from "@/components/logout-button"
import { Menu } from "lucide-react"

// Iconos para la navegación
import { LayoutDashboard, Users, ShoppingCart, Package, Megaphone, Search, Settings, Activity } from "lucide-react"

const getIcon = (icon: string | undefined) => {
  switch (icon) {
    case "dashboard":
      return <LayoutDashboard className="mr-2 h-4 w-4" />
    case "users":
      return <Users className="mr-2 h-4 w-4" />
    case "shopping-cart":
      return <ShoppingCart className="mr-2 h-4 w-4" />
    case "package":
      return <Package className="mr-2 h-4 w-4" />
    case "megaphone":
      return <Megaphone className="mr-2 h-4 w-4" />
    case "search":
      return <Search className="mr-2 h-4 w-4" />
    case "settings":
      return <Settings className="mr-2 h-4 w-4" />
    case "activity":
      return <Activity className="mr-2 h-4 w-4" />
    default:
      return null
  }
}

interface DashboardNavProps {
  isCollapsed?: boolean
}

export function DashboardNav({ isCollapsed }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <div className="relative">
      <ScrollArea className="h-[calc(100vh-64px)] pb-10">
        <div className={cn("flex flex-col gap-4 p-4", isCollapsed && "items-center")}>
          {navigationConfig.map((section, i) => (
            <div key={i} className={cn("flex flex-col gap-1", isCollapsed && "items-center")}>
              {!isCollapsed && (
                <h3 className="mb-1 px-2 text-sm font-semibold text-muted-foreground">{section.title}</h3>
              )}
              {section.items.map((item, j) => (
                <Button
                  key={j}
                  asChild
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start",
                    isCollapsed && "h-9 w-9 justify-center p-0",
                    pathname === item.href && "bg-brand/10 text-brand hover:bg-brand/20 hover:text-brand-dark",
                  )}
                >
                  <Link href={item.href}>
                    {getIcon(item.icon)}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </Button>
              ))}
            </div>
          ))}
          {!isCollapsed && <LogoutButton />}
        </div>
      </ScrollArea>
    </div>
  )
}

interface MobileDashboardNavProps {
  children?: React.ReactNode
}

export function MobileDashboardNav({ children }: MobileDashboardNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="GranitoSkate Logo" className="h-8 w-auto" />
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col gap-4 p-4">
            {navigationConfig.map((section, i) => (
              <div key={i} className="flex flex-col gap-1">
                <h3 className="mb-1 px-2 text-sm font-semibold text-muted-foreground">{section.title}</h3>
                {section.items.map((item, j) => (
                  <Button key={j} asChild variant="ghost" className="justify-start">
                    <Link href={item.href}>
                      {getIcon(item.icon)}
                      <span>{item.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            ))}
            <LogoutButton />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
