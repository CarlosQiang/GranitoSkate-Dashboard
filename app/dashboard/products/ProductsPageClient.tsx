"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { Plus, RefreshCw, Search } from "lucide-react"
import Link from "next/link"

export default function ProductsPageClient({ products = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar productos según el término de búsqueda y la pestaña activa
  const filteredProducts = products.filter((product) => {
    // Filtrar por término de búsqueda
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por estado
    let matchesStatus = true
    if (activeTab !== "all") {
      matchesStatus = product.status.toLowerCase() === activeTab
    }

    return matchesSearch && matchesStatus
  })

  // Contar productos por estado
  const activeCount = products.filter((p) => p.status.toLowerCase() === "active").length
  const draftCount = products.filter((p) => p.status.toLowerCase() === "draft").length
  const archivedCount = products.filter((p) => p.status.toLowerCase() === "archived").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos de tu tienda Shopify</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto flex-1">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todos ({products.length})</TabsTrigger>
            <TabsTrigger value="active">Activos ({activeCount})</TabsTrigger>
            <TabsTrigger value="draft">Borradores ({draftCount})</TabsTrigger>
            <TabsTrigger value="archived">Archivados ({archivedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">No se encontraron productos</p>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
