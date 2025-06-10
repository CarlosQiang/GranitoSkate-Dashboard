"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { ThemeContext } from "@/providers/theme-provider"
import { useContext } from "react"
import Image from "next/image"

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {}

const DashboardNav: React.FC<DashboardNavProps> = ({ className, ...props }) => {
  const theme = useContext(ThemeContext)

  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <div className="flex items-center space-x-2">
        <Image
          src="/logo-granito-management.png"
          alt="Granito Management app"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="text-xl font-bold">{theme?.shopName || "Granito Management app"}</span>
      </div>
    </div>
  )
}

export default DashboardNav
