"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Package, FolderOpen, Users, ShoppingCart } from "lucide-react"

export default function CacheStatus() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCacheStats()
  }, [])

  const fetchCacheStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cached/stats")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        throw new Error(data.error || "Error desconocido al obtener estadísticas de caché")
      }
    } catch (err) {
      console.error("Error al obtener estadísticas de caché:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas limpiar la caché? Esto eliminará todos los datos almacenados temporalmente.",
      )
    ) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/cached/stats", { method: "DELETE" })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar estadísticas después de limpiar
        fetchCacheStats()
      } else {
        throw new Error(data.error || "Error desconocido al limpiar caché")
      }
    } catch (err) {
      console.error("Error al limpiar caché:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de la caché</CardTitle>
          <CardDescription>Cargando información...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de la caché</CardTitle>
          <CardDescription>Error al cargar información</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchCacheStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de la caché
        </CardTitle>
        <CardDescription>Información sobre los datos almacenados temporalmente</CardDescription>
      </CardHeader>
      <CardContent>
        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <h3 className="font-medium">Productos</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <Badge variant={stats.products.count > 0 ? "default" : "outline"}>{stats.products.count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={stats.products.isValid ? "success" : "destructive"}>
                      {stats.products.isValid ? "Válida" : "Expirada"}
                    </Badge>
                  </div>
                  {stats.products.count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualización:</span>
                      <span className="text-xs">{new Date(stats.products.lastUpdated).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="h-4 w-4" />
                  <h3 className="font-medium">Colecciones</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <Badge variant={stats.collections.count > 0 ? "default" : "outline"}>
                      {stats.collections.count}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={stats.collections.isValid ? "success" : "destructive"}>
                      {stats.collections.isValid ? "Válida" : "Expirada"}
                    </Badge>
                  </div>
                  {stats.collections.count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualización:</span>
                      <span className="text-xs">{new Date(stats.collections.lastUpdated).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <h3 className="font-medium">Clientes</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <Badge variant={stats.customers.count > 0 ? "default" : "outline"}>{stats.customers.count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={stats.customers.isValid ? "success" : "destructive"}>
                      {stats.customers.isValid ? "Válida" : "Expirada"}
                    </Badge>
                  </div>
                  {stats.customers.count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualización:</span>
                      <span className="text-xs">{new Date(stats.customers.lastUpdated).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <h3 className="font-medium">Pedidos</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad:</span>
                    <Badge variant={stats.orders.count > 0 ? "default" : "outline"}>{stats.orders.count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={stats.orders.isValid ? "success" : "destructive"}>
                      {stats.orders.isValid ? "Válida" : "Expirada"}
                    </Badge>
                  </div>
                  {stats.orders.count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actualización:</span>
                      <span className="text-xs">{new Date(stats.orders.lastUpdated).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={fetchCacheStats} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button variant="destructive" size="sm" onClick={clearCache} disabled={loading}>
                Limpiar caché
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
