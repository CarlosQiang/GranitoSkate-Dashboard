"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRecentOrders } from "@/lib/api/orders"

export function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRecentOrders()
      setOrders(data)
    } catch (err) {
      console.error("Error al cargar pedidos recientes:", err)
      setError("No se pudieron cargar los pedidos recientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold">Pedidos recientes</CardTitle>
          <CardDescription>Los últimos 5 pedidos realizados en tu tienda</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={loadOrders} disabled={loading} aria-label="Actualizar pedidos">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadOrders}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{order.name}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay pedidos recientes</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/orders">
            <Plus className="mr-2 h-4 w-4" />
            Ver todos los pedidos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
