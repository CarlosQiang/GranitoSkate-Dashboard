"use client"

import { cn } from "@/lib/utils"
import type React from "react"

interface ResponsivePageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  noPadding?: boolean
}

export function ResponsivePageContainer({
  children,
  className,
  maxWidth = "7xl",
  noPadding = false,
}: ResponsivePageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth], !noPadding && "px-4 py-6", className)}>
        {children}
      </div>
    </div>
  )
}
