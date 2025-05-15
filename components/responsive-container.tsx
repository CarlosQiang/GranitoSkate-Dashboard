"use client"

import type React from "react"

import { useMobileView } from "@/hooks/use-mobile-view"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
  breakpoint?: number
}

export function ResponsiveContainer({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
  breakpoint = 768,
}: ResponsiveContainerProps) {
  const isMobile = useMobileView(breakpoint)

  return <div className={cn(className, isMobile ? mobileClassName : desktopClassName)}>{children}</div>
}
