"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Database } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function CreateTablesButton() {
  const [loading, setLoading] = useState(false)

  const createTables = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/db/create-tables")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear tablas")
      }

      toast({
        title: "Tablas creadas",
        description: "Las tablas se han creado correctamente en la base de datos.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al crear tablas:", error)
      toast({
        title: "Error al crear tablas",
        description: error instanceof Error ? error.message : "Error desconocido al crear tablas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={createTables} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando tablas...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Crear tablas
        </>
      )}
    </Button>
  )
}
