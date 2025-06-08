"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"
import { PromocionesClient } from "@/components/promociones-client"
import { fetchPromociones } from "@/lib/api/promociones"

export function PromocionesListWrapper() {
  const [promociones, setPromociones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("todas")

  const loadPromociones = async () => {
    try {
      console.log("🔍 Obteniendo promociones con filtro:", activeTab)
      setIsLoading(true)
      setError(null)

      // Usar ruta relativa para evitar problemas de CORS
      const data = await fetchPromociones(activeTab)
      setPromociones(data)
    } catch (error) {
      console.error("❌ Error en PromocionesListWrapper:", error)
      setError(`No se pudieron cargar las promociones. ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPromociones()
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const filteredPromociones = promociones.filter((promocion) => {
    if (activeTab === "todas") return true
    if (activeTab === "activas") return promocion.estado === "ACTIVE"
    if (activeTab === "programadas") return promocion.estado === "SCHEDULED"
    if (activeTab === "expiradas") return promocion.estado === "EXPIRED"
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promociones</CardTitle>
        <CardDescription>Gestiona las promociones y descuentos de tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todas" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="activas">Activas</TabsTrigger>
            <TabsTrigger value="programadas">Programadas</TabsTrigger>
            <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
          </TabsList>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{error}</p>
                <Button variant="outline" size="sm" className="w-fit" onClick={loadPromociones}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          <TabsContent value="todas">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="p-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <PromocionesClient promociones={filteredPromociones} />
            )}
          </TabsContent>

          <TabsContent value="activas">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="p-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <PromocionesClient promociones={filteredPromociones} />
            )}
          </TabsContent>

          <TabsContent value="programadas">
            {isLoading ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <PromocionesClient promociones={filteredPromociones} />
            )}
          </TabsContent>

          <TabsContent value="expiradas">
            {isLoading ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <PromocionesClient promociones={filteredPromociones} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
