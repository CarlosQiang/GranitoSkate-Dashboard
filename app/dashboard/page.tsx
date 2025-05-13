"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c59d45]" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bienvenido, {session.user.name}</h1>
      <p>Has iniciado sesión correctamente.</p>
    </div>
  )
}
