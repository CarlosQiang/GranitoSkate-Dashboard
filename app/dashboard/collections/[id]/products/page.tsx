"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { CollectionProductManager } from "@/components/collection-product-manager"
import { formatShopifyId } from "@/lib/shopify"

export default function CollectionProductsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("add")

  const handleComplete = () => {
    router.push(`/dashboard/collections/${params.id}`)
  }

  // Asegurarse de que el ID tenga el formato correcto
  const formattedId = formatShopifyId(params.id, "Collection")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Gestionar productos de la colección</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Añadir productos</TabsTrigger>
          <TabsTrigger value="remove">Eliminar productos</TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-4">
          <CollectionProductManager collectionId={formattedId} onComplete={handleComplete} mode="add" />
        </TabsContent>
        <TabsContent value="remove" className="mt-4">
          <CollectionProductManager collectionId={formattedId} onComplete={handleComplete} mode="remove" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
