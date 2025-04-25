"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { CollectionProductManager } from "@/components/collection-product-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProductCollectionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)

  const handleComplete = () => {
    setIsCompleted(true)
    // Esperar un momento antes de redirigir
    setTimeout(() => {
      router.back()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar colecciones</h1>
      </div>

      {isCompleted ? (
        <Alert className="border-green-500 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertTitle>Operación completada</AlertTitle>
          <AlertDescription>La operación se ha completado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      ) : (
        <CollectionProductManager productId={params.id} onComplete={handleComplete} />
      )}
    </div>
  )
}
