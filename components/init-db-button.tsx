"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function InitDbButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInitDb = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-db")
      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Base de datos inicializada",
          description: data.adminCreated
            ? "Se ha creado el usuario administrador por defecto."
            : "La base de datos ya estaba inicializada.",
          variant: "default",
        })
      } else {
        throw new Error(data.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al inicializar la base de datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleInitDb} disabled={loading} className="bg-[#c7a04a] hover:bg-[#b08e42]">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Inicializando...
        </>
      ) : (
        "Inicializar Base de Datos"
      )}
    </Button>
  )
}
