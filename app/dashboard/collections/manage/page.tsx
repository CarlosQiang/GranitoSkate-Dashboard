"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CollectionProductManager } from "@/components/collection-product-manager"
import { Plus, ArrowLeft, Tags } from "lucide-react"

export default function ManageCollectionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("add")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Gestionar colecciones</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/collections/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva colección
          </Button>
          <Button onClick={() => router.push("/dashboard/products/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Organiza tus productos
          </CardTitle>
          <CardDescription>Añade o elimina productos de tus colecciones para organizar mejor tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Añadir productos a colección</TabsTrigger>
              <TabsTrigger value="remove">Eliminar productos de colección</TabsTrigger>
            </TabsList>
            <TabsContent value="add" className="pt-4">
              <CollectionProductManager mode="add" />
            </TabsContent>
            <TabsContent value="remove" className="pt-4">
              <CollectionProductManager mode="remove" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
