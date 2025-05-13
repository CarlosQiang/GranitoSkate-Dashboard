"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function DashboardOverviewPage() {
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
        <span className="ml-2 text-lg">Cargando...</span>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold text-[#c59d45]">Panel de Control</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Bienvenido, {session.user?.name || "Administrador"}</h2>
          <p className="text-gray-500">Accede a todas las funcionalidades del panel de administración desde aquí.</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Productos</h2>
          <p className="text-gray-500">Gestiona el inventario, categorías y precios de tus productos.</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Clientes</h2>
          <p className="text-gray-500">Visualiza y gestiona la información de tus clientes.</p>
        </div>
      </div>
    </div>
  )
}
