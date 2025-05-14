"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Database, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function SyncManager() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  const syncEntity = async (entity: string) => {
    setStatus("loading")
    setMessage(`Sincronizando ${getEntityName(entity)}...`)
    setResult(null)

    try {
      const response = await fetch(`/api/sync?entity=${entity}`)
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(`Sincronización de ${getEntityName(entity)} completada`)
        setResult(data.result)
      } else {
        setStatus("error")
        setMessage(data.message || `Error al sincronizar ${getEntityName(entity)}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error al sincronizar ${getEntityName(entity)}: ${(error as Error).message}`)
    }
  }

  const syncAll = async () => {
    setStatus("loading")
    setMessage("Sincronizando todos los datos...")
    setResult(null)

    try {
      const response = await fetch("/api/sync")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Sincronización completa finalizada")
        setResult(data.result)
      } else {
        setStatus("error")
        setMessage(data.message || "Error en la sincronización")
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error en la sincronización: ${(error as Error).message}`)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setStatus("idle")
    setMessage("")
    setResult(null)
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
      default:
        return "todos los datos"
    }
  }

  const renderSyncButton = (entity: string) => {
    const isLoading = status === "loading" && activeTab === entity

    return (
      <Button
        onClick={() => (entity === "all" ? syncAll() : syncEntity(entity))}
        disabled={status === "loading"}
        className="w-full"
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Sincronizar {getEntityName(entity)}
          </>
        )}
      </Button>
    )
  }

  const renderResult = () => {
    if (!result) return null

    if (activeTab === "all") {
      return (
        <div className="space-y-4 mt-4">
          {Object.entries(result).map(([entity, data]: [string, any]) => (
            <div key={entity} className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2 capitalize">{entity}</h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="bg-green-50 p-2 rounded-md">
                  <p className="text-green-700 font-medium">Creados</p>
                  <p className="text-2xl font-bold text-green-600">{data.created}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="text-blue-700 font-medium">Actualizados</p>
                  <p className="text-2xl font-bold text-blue-600">{data.updated}</p>
                </div>
                <div className="bg-red-50 p-2 rounded-md">
                  <p className="text-red-700 font-medium">Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">{data.failed}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <p className="text-gray-700 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-600">{data.total}</p>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={((data.created + data.updated) / data.total) * 100} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      )
    } else {
      return (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <p className="text-green-700 font-medium">Creados</p>
              <p className="text-2xl font-bold text-green-600">{result.created}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-md">
              <p className="text-blue-700 font-medium">Actualizados</p>
              <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-md">
              <p className="text-red-700 font-medium">Fallidos</p>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-gray-700 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-600">{result.total}</p>
            </div>
          </div>
          <div className="mt-2">
            <Progress value={((result.created + result.updated) / result.total) * 100} className="h-2" />
          </div>
        </div>
      )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sincronización de Datos
        </CardTitle>
        <CardDescription>Sincroniza los datos entre Shopify y la base de datos</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all">Todo</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="collections">Colecciones</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="promotions">Promociones</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar todos los datos entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>

          <TabsContent value="products">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar los productos entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>

          <TabsContent value="collections">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar las colecciones entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>

          <TabsContent value="customers">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar los clientes entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>

          <TabsContent value="orders">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar los pedidos entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>

          <TabsContent value="promotions">
            {status === "loading" && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Sincronizando</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "idle" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sincronización pendiente</AlertTitle>
                <AlertDescription>
                  Haz clic en el botón para sincronizar las promociones entre Shopify y la base de datos
                </AlertDescription>
              </Alert>
            )}

            {renderResult()}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "all" && renderSyncButton("all")}
        {activeTab === "products" && renderSyncButton("products")}
        {activeTab === "collections" && renderSyncButton("collections")}
        {activeTab === "customers" && renderSyncButton("customers")}
        {activeTab === "orders" && renderSyncButton("orders")}
        {activeTab === "promotions" && renderSyncButton("promotions")}
      </CardFooter>
    </Card>
  )
}
