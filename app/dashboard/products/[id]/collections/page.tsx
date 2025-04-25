"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CollectionProductManager } from "@/components/collection-product-manager"

export default function ProductCollectionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)

  const handleComplete = () => {
    setIsCompleted(true)
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
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <p className="text-green-800">Operación completada correctamente. Redirigiendo...</p>
        </div>
      ) : (
        <CollectionProductManager productId={params.id} onComplete={handleComplete} />
      )}
    </div>
  )
}
