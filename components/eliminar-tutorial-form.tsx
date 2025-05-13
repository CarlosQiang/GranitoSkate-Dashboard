"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EliminarTutorialFormProps {
  tutorial: any
}

export function EliminarTutorialForm({ tutorial }: EliminarTutorialFormProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tutoriales/${tutorial.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar el tutorial")
      }

      toast({
        title: "Tutorial eliminado",
        description: "El tutorial se ha eliminado correctamente",
      })

      router.push("/dashboard/tutoriales")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el tutorial",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
      Eliminar tutorial
    </Button>
  )
}
