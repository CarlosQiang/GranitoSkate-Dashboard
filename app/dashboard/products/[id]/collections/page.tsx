"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Plus } from "lucide-react"
import { CollectionProductManager } from "@/components/collection-product-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductCollectionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState("add")

  const handleComplete = () => {
    setIsCompleted(true)
    // Esperar un momento antes de redirigir
    setTimeout(() => {
      router.back()
    }, 2000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Gestionar colecciones del producto
          </h1>
        </div>
        <Button onClick={() => router.push("/dashboard/collections/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva colección
        </Button>
      </div>

      {isCompleted ? (
        <Alert className="border-green-500 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertTitle>¡Operación completada!</AlertTitle>
          <AlertDescription>La operación se ha completado correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Añadir a colecciones</TabsTrigger>
            <TabsTrigger value="remove">Eliminar de colecciones</TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="pt-4">
            <CollectionProductManager productId={params.id} onComplete={handleComplete} mode="add" />
          </TabsContent>
          <TabsContent value="remove" className="pt-4">
            <CollectionProductManager productId={params.id} onComplete={handleComplete} mode="remove" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
