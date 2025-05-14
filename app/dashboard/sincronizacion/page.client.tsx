"use client"

import { useState, useEffect } from "react"
import SyncManager from "@/components/sync-manager"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RegistroSincronizacion from "@/components/registro-sincronizacion"

export default function SincronizacionClientPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sincronización</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la sincronización de datos entre Shopify y la base de datos local.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8">
        <SyncManager />

        <Card>
          <CardHeader>
            <CardTitle>Estado de la Base de Datos</CardTitle>
            <CardDescription>Información sobre los datos almacenados en la base de datos local.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="registros">
              <TabsList className="mb-4">
                <TabsTrigger value="registros">Registros de Sincronización</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="registros">
                <RegistroSincronizacion />
              </TabsContent>

              <TabsContent value="estadisticas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Productos" endpoint="/api/db/productos/count" />
                  <StatCard title="Colecciones" endpoint="/api/db/colecciones/count" />
                  <StatCard title="Clientes" endpoint="/api/db/clientes/count" />
                  <StatCard title="Pedidos" endpoint="/api/db/pedidos/count" />
                  <StatCard title="Promociones" endpoint="/api/db/promociones/count" />
                  <StatCard title="Sincronizaciones" endpoint="/api/db/registro/count" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, endpoint }: { title: string; endpoint: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <StatCounter endpoint={endpoint} />
      </CardContent>
    </Card>
  )
}

function StatCounter({ endpoint }: { endpoint: string }) {
  return (
    <div className="text-2xl font-bold">
      <ClientStatCounter endpoint={endpoint} />
    </div>
  )
}

function ClientStatCounter({ endpoint }: { endpoint: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error("Error al obtener el conteo")
        }
        const data = await response.json()
        setCount(data.count)
      } catch (error) {
        console.error(`Error al obtener conteo desde ${endpoint}:`, error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchCount()
  }, [endpoint])

  if (loading) {
    return <div>...</div>
  }

  if (error) {
    return <div className="text-red-500">Error</div>
  }

  return <div>{count}</div>
}
