"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function EliminarAdministradorForm({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEliminar = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/administradores/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el administrador")
      }

      router.push("/dashboard/administradores")
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar:", error)
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleEliminar} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Eliminando...
        </>
      ) : (
        "Eliminar administrador"
      )}
    </Button>
  )
}
