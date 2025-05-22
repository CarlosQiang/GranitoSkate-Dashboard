"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  title: string
  icon: React.ReactNode
  isCollapsed?: boolean
  variant?: "default" | "ghost"
}

export function NavItem({ href, title, icon, isCollapsed = false, variant = "default" }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : variant === "ghost"
            ? "hover:bg-muted"
            : "hover:bg-muted hover:text-foreground",
        isCollapsed && "justify-center px-2",
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  )
}
