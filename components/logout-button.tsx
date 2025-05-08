"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading} className="w-full justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  )
}
