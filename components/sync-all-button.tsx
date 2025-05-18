"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function SyncAllButton() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({
    products: false,
    collections: false,
    customers: false,
    orders: false,
  })

  const syncAll = async () => {
    setLoading(true)
    setProgress({
      products: false,
      collections: false,
      customers: false,
      orders: false,
    })

    try {
      // Sincronizar productos
      setProgress((prev) => ({ ...prev, products: true }))
      const productsResponse = await fetch("/api/sync/products")
      const productsData = await productsResponse.json()

      if (!productsResponse.ok) {
        throw new Error(productsData.error || "Error al sincronizar productos")
      }

      // Sincronizar colecciones
      setProgress((prev) => ({ ...prev, collections: true }))
      const collectionsResponse = await fetch("/api/sync/collections")
      const collectionsData = await collectionsResponse.json()

      if (!collectionsResponse.ok) {
        throw new Error(collectionsData.error || "Error al sincronizar colecciones")
      }

      // Sincronizar clientes
      setProgress((prev) => ({ ...prev, customers: true }))
      const customersResponse = await fetch("/api/sync/customers")
      const customersData = await customersResponse.json()

      if (!customersResponse.ok) {
        throw new Error(customersData.error || "Error al sincronizar clientes")
      }

      // Sincronizar pedidos
      setProgress((prev) => ({ ...prev, orders: true }))
      const ordersResponse = await fetch("/api/sync/orders")
      const ordersData = await ordersResponse.json()

      if (!ordersResponse.ok) {
        throw new Error(ordersData.error || "Error al sincronizar pedidos")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${productsData.count} productos, ${collectionsData.count} colecciones, ${customersData.count} clientes y ${ordersData.count} pedidos.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error al sincronizar datos:", error)
      toast({
        title: "Error al sincronizar",
        description: error instanceof Error ? error.message : "Error desconocido al sincronizar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={syncAll} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sincronizando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sincronizar todo
        </>
      )}
    </Button>
  )
}
