"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Power } from "lucide-react"

export function LogoutButton() {
  return (
    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
      <Power className="mr-2 h-4 w-4" />
      Cerrar sesión
    </Button>
  )
}
