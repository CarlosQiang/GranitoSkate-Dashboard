"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CollectionProductManager } from "@/components/collection-product-manager"

export default function CollectionProductsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mode, setMode] = useState<"add" | "remove">("add")

  const handleComplete = () => {
    router.push(`/dashboard/collections/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Gestionar productos de la colección</h1>
        </div>
      </div>

      <CollectionProductManager collectionId={params.id} onComplete={handleComplete} mode={mode} />
    </div>
  )
}
