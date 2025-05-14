"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, RefreshCw, Clock } from "lucide-react"

export function SyncManager() {
  const [syncStatus, setSyncStatus] = useState<{
    isLoading: boolean
    entity: string | null
    result: any | null
    error: string | null
  }>({
    isLoading: false,
    entity: null,
    result: null,
    error: null,
  })

  const startSync = async (entity: string) => {
    setSyncStatus({
      isLoading: true,
      entity,
      result: null,
      error: null,
    })

    try {
      const response = await fetch(`/api/sync?entity=${entity}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error en la sincronización")
      }

      setSyncStatus({
        isLoading: false,
        entity,
        result: data.result,
        error: null,
      })
    } catch (error) {
      console.error(`Error al sincronizar ${entity}:`, error)
      setSyncStatus({
        isLoading: false,
        entity,
        result: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  const renderSyncResult = (entity: string) => {
    if (syncStatus.isLoading && syncStatus.entity === entity) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-sm text-gray-500">Sincronizando {getEntityName(entity)}...</p>
          <Progress className="w-full mt-4" value={undefined} />
        </div>
      )
    }

    if (syncStatus.error && syncStatus.entity === entity) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{syncStatus.error}</AlertDescription>
        </Alert>
      )
    }

    if (syncStatus.result && syncStatus.entity === entity) {
      const result = syncStatus.entity === "all" ? syncStatus.result[entity] : syncStatus.result

      if (!result) return null

      return (
        <div className="mt-4 space-y-2">
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Sincronización completada</AlertTitle>
            <AlertDescription className="text-green-600">
              Se han sincronizado {result.total} {getEntityName(entity)}.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-green-50 p-2 rounded-md text-center">
              <p className="text-sm text-gray-500">Creados</p>
              <p className="text-xl font-bold text-green-600">{result.created}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-md text-center">
              <p className="text-sm text-gray-500">Actualizados</p>
              <p className="text-xl font-bold text-blue-600">{result.updated}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-md text-center">
              <p className="text-sm text-gray-500">Fallidos</p>
              <p className="text-xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center mt-2">
            <Clock className="h-3 w-3 mr-1" />
            Última sincronización: {new Date().toLocaleString()}
          </div>
        </div>
      )
    }

    return null
  }

  const getEntityName = (entity: string): string => {
    switch (entity) {
      case "products":
        return "productos"
      case "collections":
        return "colecciones"
      case "customers":
        return "clientes"
      case "orders":
        return "pedidos"
      case "promotions":
        return "promociones"
      case "all":
        return "todo"
      default:
        return entity
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sincronización con Shopify</CardTitle>
        <CardDescription>Sincroniza los datos de tu tienda Shopify con la base de datos local.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="products">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="collections">Colecciones</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="promotions">Promociones</TabsTrigger>
            <TabsTrigger value="all">Todo</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza los productos de tu tienda Shopify con la base de datos local. Esto incluirá variantes,
                imágenes y metadatos.
              </p>
              <Button onClick={() => startSync("products")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "products" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Productos"
                )}
              </Button>
              {renderSyncResult("products")}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza las colecciones de tu tienda Shopify con la base de datos local. Esto incluirá las relaciones
                con productos.
              </p>
              <Button onClick={() => startSync("collections")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "collections" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Colecciones"
                )}
              </Button>
              {renderSyncResult("collections")}
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza los clientes de tu tienda Shopify con la base de datos local.
              </p>
              <Button onClick={() => startSync("customers")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "customers" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Clientes"
                )}
              </Button>
              {renderSyncResult("customers")}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza los pedidos de tu tienda Shopify con la base de datos local.
              </p>
              <Button onClick={() => startSync("orders")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "orders" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Pedidos"
                )}
              </Button>
              {renderSyncResult("orders")}
            </div>
          </TabsContent>

          <TabsContent value="promotions">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza las promociones de tu tienda Shopify con la base de datos local.
              </p>
              <Button onClick={() => startSync("promotions")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "promotions" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Promociones"
                )}
              </Button>
              {renderSyncResult("promotions")}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Sincroniza todos los datos de tu tienda Shopify con la base de datos local. Este proceso puede tardar
                varios minutos.
              </p>
              <Button onClick={() => startSync("all")} disabled={syncStatus.isLoading} className="w-full">
                {syncStatus.isLoading && syncStatus.entity === "all" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Todo"
                )}
              </Button>
              {renderSyncResult("all")}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          La sincronización puede tardar varios minutos dependiendo de la cantidad de datos.
        </p>
      </CardFooter>
    </Card>
  )
}
