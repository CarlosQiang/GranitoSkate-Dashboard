"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ShopifyDiagnosticPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    status: "success" | "error" | "pending"
    message: string
    details?: string
  }>({
    status: "pending",
    message: "No se ha ejecutado ninguna prueba",
  })
  const [shopifyConfig, setShopifyConfig] = useState({
    domain: "",
    accessToken: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Cargar la configuración actual
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/shopify/config-check")
        const data = await response.json()
        if (data.success) {
          setShopifyConfig({
            domain: data.config.domain || "",
            accessToken: data.config.accessToken ? "••••••••" : "",
          })
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
      }
    }

    loadConfig()
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    setTestResults({
      status: "pending",
      message: "Probando conexión...",
    })

    try {
      const response = await fetch("/api/shopify/test-connection")
      const data = await response.json()

      if (data.success) {
        setTestResults({
          status: "success",
          message: "Conexión exitosa a Shopify",
          details: `Tienda: ${data.shopName}, Plan: ${data.shopPlan}`,
        })
      } else {
        setTestResults({
          status: "error",
          message: "Error al conectar con Shopify",
          details: data.error || "No se pudo establecer conexión con la API de Shopify",
        })
      }
    } catch (error) {
      setTestResults({
        status: "error",
        message: "Error en la prueba de conexión",
        details: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/shopify/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: shopifyConfig.domain,
          accessToken: shopifyConfig.accessToken === "••••••••" ? null : shopifyConfig.accessToken,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Configuración guardada correctamente")
      } else {
        alert(`Error al guardar: ${data.error || "Error desconocido"}`)
      }
    } catch (error) {
      alert(`Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Conexión a Shopify</h1>

      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Prueba de Conexión</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="troubleshoot">Solución de Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Prueba de Conexión a Shopify</CardTitle>
              <CardDescription>
                Verifica si la aplicación puede conectarse correctamente a tu tienda Shopify
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.status !== "pending" && (
                <Alert
                  className={`mb-4 ${
                    testResults.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  {testResults.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>{testResults.status === "success" ? "Conexión exitosa" : "Error de conexión"}</AlertTitle>
                  <AlertDescription>
                    {testResults.message}
                    {testResults.details && (
                      <div className="mt-2 text-sm">
                        <strong>Detalles:</strong> {testResults.details}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                <Button onClick={testConnection} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Probando...
                    </>
                  ) : (
                    "Probar Conexión"
                  )}
                </Button>
                <div className="text-sm text-gray-500">
                  Esta prueba verifica la conexión a la API de Shopify usando las credenciales configuradas.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Shopify</CardTitle>
              <CardDescription>Actualiza las credenciales de conexión a tu tienda Shopify</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="domain">Dominio de la Tienda</Label>
                  <Input
                    id="domain"
                    placeholder="tu-tienda.myshopify.com"
                    value={shopifyConfig.domain}
                    onChange={(e) => setShopifyConfig({ ...shopifyConfig, domain: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    Ejemplo: tu-tienda.myshopify.com (sin https:// ni otros prefijos)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="token">Token de Acceso</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="shpat_..."
                    value={shopifyConfig.accessToken}
                    onChange={(e) => setShopifyConfig({ ...shopifyConfig, accessToken: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    Token de acceso de la API de Shopify. Debe comenzar con &quot;shpat_&quot;
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot">
          <Card>
            <CardHeader>
              <CardTitle>Solución de Problemas Comunes</CardTitle>
              <CardDescription>Guía para resolver problemas frecuentes de conexión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Error 401 - No autorizado</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Este error indica que el token de acceso no es válido o ha expirado.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Verifica que el token de acceso sea correcto</li>
                    <li>Genera un nuevo token en tu panel de administración de Shopify</li>
                    <li>Asegúrate de que el token tenga los permisos necesarios</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Error 404 - No encontrado</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Este error indica que la URL de la tienda no es correcta o no existe.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Verifica que el dominio de la tienda sea correcto</li>
                    <li>Asegúrate de usar solo el nombre de la tienda (sin https:// ni otros prefijos)</li>
                    <li>Comprueba que la tienda esté activa y no suspendida</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Error 500 - Error del servidor</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Este error indica un problema en el servidor de Shopify o en la consulta.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Verifica que las consultas GraphQL sean correctas</li>
                    <li>Comprueba si hay límites de tasa (rate limits) excedidos</li>
                    <li>Intenta nuevamente más tarde si el problema persiste</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Variables de entorno</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Asegúrate de que las siguientes variables de entorno estén configuradas correctamente:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</li>
                    <li>SHOPIFY_ACCESS_TOKEN</li>
                    <li>
                      SHOPIFY_API_URL (normalmente https://tu-tienda.myshopify.com/admin/api/2023-07/graphql.json)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
