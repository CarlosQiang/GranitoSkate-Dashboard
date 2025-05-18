"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

// Marcar la página como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para cargar productos
  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulamos productos para evitar errores de API
      setProducts([
        { id: 1, title: "Producto de prueba 1", status: "ACTIVE" },
        { id: 2, title: "Producto de prueba 2", status: "DRAFT" },
      ])
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestiona los productos de tu tienda</CardTitle>
          <CardDescription>Visualiza, edita y crea nuevos productos para tu tienda online.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar productos..." className="pl-8" />
              </div>
              <Button variant="outline">Sincronizar</Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="draft">Borradores</TabsTrigger>
                <TabsTrigger value="archived">Archivados</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <div className="text-center py-4">Cargando productos...</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <h3 className="font-medium">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">{product.status}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
