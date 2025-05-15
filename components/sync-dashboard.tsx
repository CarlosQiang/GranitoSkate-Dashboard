"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, RefreshCw, Database, ShoppingBag, Tag, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SyncResult {
  created: number
  updated: number
  failed: number
  total: number
}

export function SyncDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("productos")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleSync = async (type: "productos" | "promociones" | "clientes") => {
    setIsSyncing(true)
    setError(null)
    setSyncResult(null)
    setProgress(10)

    try {
      // Determinar la URL del endpoint según el tipo
      let endpoint = ""
      let entityName = ""

      switch (type) {
        case "productos":
          endpoint = "/api/sync/products"
          entityName = "productos"
          break
        case "promociones":
          endpoint = "/api/sync/promotions"
          entityName = "promociones"
          break
        case "clientes":
          endpoint = "/api/sync/customers"
          entityName = "clientes"
          break
      }

      setProgress(30)

      // Realizar la petición
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error al sincronizar ${entityName}`)
      }

      const result = await response.json()
      setSyncResult(result)

      toast({
        title: "Sincronización completada",
        description: `Se han sincronizado ${result.total} ${entityName}`,
        variant: "default",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")

      toast({
        title: "Error de sincronización",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setProgress(100)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sincronización con Shopify</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="productos" disabled={isSyncing}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="promociones" disabled={isSyncing}>
            <Tag className="mr-2 h-4 w-4" />
            Promociones
          </TabsTrigger>
          <TabsTrigger value="clientes" disabled={isSyncing}>
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Productos</CardTitle>
              <CardDescription>
                Sincroniza los productos de tu tienda Shopify con la base de datos local.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span>Sincronizando productos...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {syncResult && !isSyncing && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sincronización completada</AlertTitle>
                    <AlertDescription>Se han sincronizado {syncResult.total} productos.</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-green-500 mb-2">Creados</Badge>
                      <span className="text-2xl font-bold">{syncResult.created}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-blue-500 mb-2">Actualizados</Badge>
                      <span className="text-2xl font-bold">{syncResult.updated}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-red-500 mb-2">Fallidos</Badge>
                      <span className="text-2xl font-bold">{syncResult.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSync("productos")} disabled={isSyncing} className="w-full">
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar Productos
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="promociones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Promociones</CardTitle>
              <CardDescription>
                Sincroniza las promociones y descuentos de tu tienda Shopify con la base de datos local.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span>Sincronizando promociones...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {syncResult && !isSyncing && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sincronización completada</AlertTitle>
                    <AlertDescription>Se han sincronizado {syncResult.total} promociones.</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-green-500 mb-2">Creadas</Badge>
                      <span className="text-2xl font-bold">{syncResult.created}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-blue-500 mb-2">Actualizadas</Badge>
                      <span className="text-2xl font-bold">{syncResult.updated}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-red-500 mb-2">Fallidas</Badge>
                      <span className="text-2xl font-bold">{syncResult.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSync("promociones")} disabled={isSyncing} className="w-full">
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar Promociones
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Clientes</CardTitle>
              <CardDescription>
                Sincroniza los clientes de tu tienda Shopify con la base de datos local.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span>Sincronizando clientes...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {syncResult && !isSyncing && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sincronización completada</AlertTitle>
                    <AlertDescription>Se han sincronizado {syncResult.total} clientes.</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-green-500 mb-2">Creados</Badge>
                      <span className="text-2xl font-bold">{syncResult.created}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-blue-500 mb-2">Actualizados</Badge>
                      <span className="text-2xl font-bold">{syncResult.updated}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-lg">
                      <Badge className="bg-red-500 mb-2">Fallidos</Badge>
                      <span className="text-2xl font-bold">{syncResult.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSync("clientes")} disabled={isSyncing} className="w-full">
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar Clientes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
