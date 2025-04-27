"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigationItems } from "@/config/navigation"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden w-56 sm:w-64 flex-col border-r bg-muted/40 md:flex">
      <div className="flex flex-col gap-1 p-2 sm:p-4">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-granito text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
