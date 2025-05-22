"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SystemConfigChecker() {
  const [envStatus, setEnvStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [shopifyStatus, setShopifyStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [dbStatus, setDbStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [envData, setEnvData] = useState<any>(null)
  const [shopifyData, setShopifyData] = useState<any>(null)
  const [dbData, setDbData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkEnvVariables = async () => {
    try {
      setEnvStatus("loading")
      setError(null)

      const response = await fetch("/api/system/env-check")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar las variables de entorno")
      }

      setEnvData(data)
      setEnvStatus(data.allRequired ? "success" : "error")
    } catch (err) {
      console.error("Error al verificar las variables de entorno:", err)
      setEnvStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar las variables de entorno")
    }
  }

  const checkShopifyConnection = async () => {
    try {
      setShopifyStatus("loading")

      const response = await fetch("/api/shopify/test-connection")
      const data = await response.json()

      setShopifyData(data)
      setShopifyStatus(data.success ? "success" : "error")
    } catch (err) {
      console.error("Error al verificar la conexión con Shopify:", err)
      setShopifyStatus("error")
    }
  }

  const checkDbConnection = async () => {
    try {
      setDbStatus("loading")

      const response = await fetch("/api/db/check")
      const data = await response.json()

      setDbData(data)
      setDbStatus(data.connected ? "success" : "error")
    } catch (err) {
      console.error("Error al verificar la conexión con la base de datos:", err)
      setDbStatus("error")
    }
  }

  const checkAllSystems = () => {
    checkEnvVariables()
    checkShopifyConnection()
    checkDbConnection()
  }

  useEffect(() => {
    checkAllSystems()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verificación del Sistema</CardTitle>
        <CardDescription>Comprueba el estado de todos los componentes del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="env">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="env">Variables de Entorno</TabsTrigger>
            <TabsTrigger value="shopify">Conexión Shopify</TabsTrigger>
            <TabsTrigger value="db">Base de Datos</TabsTrigger>
          </TabsList>

          <TabsContent value="env" className="space-y-4 mt-4">
            {envStatus === "loading" && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <p>Verificando variables de entorno...</p>
              </div>
            )}

            {envStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Faltan variables de entorno</AlertTitle>
                <AlertDescription>
                  {error || "Algunas variables de entorno requeridas no están configuradas"}

                  {envData && envData.variables && (
                    <div className="mt-4 space-y-2">
                      <p className="font-semibold">Estado de las variables:</p>
                      <ul className="space-y-1">
                        {Object.entries(envData.variables).map(([name, info]: [string, any]) => (
                          <li key={name} className="flex items-start">
                            <span className={`mr-2 ${info.exists ? "text-green-500" : "text-red-500"}`}>
                              {info.exists ? "✓" : "✗"}
                            </span>
                            <div>
                              <span className="font-medium">{name}</span>
                              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                {info.required ? "Requerida" : "Opcional"}
                              </span>
                              {!info.exists && info.required && (
                                <p className="text-xs text-red-500 mt-0.5">Esta variable es necesaria</p>
                              )}
                              {info.description && <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {envStatus === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Variables de entorno configuradas correctamente</AlertTitle>
                <AlertDescription>
                  Todas las variables de entorno requeridas están configuradas correctamente.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="shopify" className="space-y-4 mt-4">
            {shopifyStatus === "loading" && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <p>Verificando conexión con Shopify...</p>
              </div>
            )}

            {shopifyStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de conexión con Shopify</AlertTitle>
                <AlertDescription>
                  {shopifyData?.message || "No se pudo conectar con Shopify. Verifica tus credenciales."}

                  {shopifyData && (
                    <div className="mt-4 space-y-2">
                      <p className="font-semibold">Detalles:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Dominio de la tienda: {shopifyData.config?.shopDomain || "No configurado"}
                          {!shopifyData.config?.shopDomain && (
                            <span className="text-xs text-red-500 ml-2">Requerido</span>
                          )}
                        </li>
                        <li>
                          Token de acceso: {shopifyData.config?.accessToken ? "Configurado" : "No configurado"}
                          {!shopifyData.config?.accessToken && (
                            <span className="text-xs text-red-500 ml-2">Requerido</span>
                          )}
                        </li>
                        <li>
                          URL de la API: {shopifyData.config?.apiUrl || "No configurado"}
                          {!shopifyData.config?.apiUrl && <span className="text-xs text-red-500 ml-2">Requerido</span>}
                        </li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {shopifyStatus === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Conexión con Shopify establecida</AlertTitle>
                <AlertDescription>
                  La conexión con Shopify se ha establecido correctamente.
                  {shopifyData?.storeInfo && (
                    <div className="mt-2">
                      <p className="font-medium">Información de la tienda:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Nombre: {shopifyData.storeInfo.name}</li>
                        <li>Plan: {shopifyData.storeInfo.plan}</li>
                        <li>Dominio: {shopifyData.storeInfo.domain}</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="db" className="space-y-4 mt-4">
            {dbStatus === "loading" && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <p>Verificando conexión con la base de datos...</p>
              </div>
            )}

            {dbStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de conexión con la base de datos</AlertTitle>
                <AlertDescription>
                  {dbData?.message || "No se pudo conectar con la base de datos. Verifica la configuración."}
                </AlertDescription>
              </Alert>
            )}

            {dbStatus === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Conexión con la base de datos establecida</AlertTitle>
                <AlertDescription>
                  La conexión con la base de datos se ha establecido correctamente.
                  {dbData?.details && (
                    <div className="mt-2">
                      <p className="font-medium">Detalles de la conexión:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Tipo: {dbData.details.type}</li>
                        <li>Versión: {dbData.details.version}</li>
                        <li>Tablas: {dbData.details.tables} tablas encontradas</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={checkAllSystems} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Verificar todos los sistemas
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SystemConfigChecker
