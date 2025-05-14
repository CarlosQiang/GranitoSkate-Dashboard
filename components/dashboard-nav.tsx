"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dashboardNavItems } from "@/config/dashboard"

export default function DashboardNav() {
  const path = usePathname()

  if (!dashboardNavItems?.length) {
    return null
  }

  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className="flex flex-col gap-2 p-2">
        {dashboardNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              path === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.title}
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
