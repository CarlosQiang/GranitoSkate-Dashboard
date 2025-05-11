"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  iconOnly?: boolean
}

export function LogoutButton({ variant = "outline", className = "", iconOnly = false }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <Button
      variant={variant}
      className={cn("flex items-center justify-center gap-2", iconOnly ? "p-2" : "", className)}
      onClick={handleLogout}
      aria-label="Cerrar sesión"
    >
      <LogOut className={cn("h-4 w-4", iconOnly ? "mr-0" : "mr-1")} />
      {!iconOnly && "Cerrar sesión"}
    </Button>
  )
}
