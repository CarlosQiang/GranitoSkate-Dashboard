"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ArrowRight, Info } from "lucide-react"
import ShopifyConfigChecker from "@/components/shopify-config-checker"
import { useToast } from "@/components/ui/use-toast"

export default function ShopifyDiagnosticsPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [shopifyStatus, setShopifyStatus] = useState<"idle" | "checking" | "success" | "error">("idle")
  const [shopInfo, setShopInfo] = useState<any>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [testResults, setTestResults] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    checkEnvVars()
  }, [])

  const checkEnvVars = async () => {
    try {
      const response = await fetch("/api/system/env-check")
      const data = await response.json()

      if (response.ok) {
        setEnvVars(data.vars || {})
      }
    } catch (error) {
      console.error("Error al verificar variables de entorno:", error)
    }
  }

  const runShopifyTest = async () => {
    setIsChecking(true)
    setShopifyStatus("checking")
    setErrorDetails(null)
    setTestResults([])

    try {
      // Paso 1: Verificar variables de entorno
      await checkEnvVars()
      setTestResults((prev) => [
        ...prev,
        {
          name: "Variables de entorno",
          status: envVars.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN && envVars.SHOPIFY_ACCESS_TOKEN ? "success" : "error",
          message:
            envVars.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN && envVars.SHOPIFY_ACCESS_TOKEN
              ? "Variables de entorno configuradas correctamente"
              : "Faltan variables de entorno necesarias",
        },
      ])

      if (!envVars.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !envVars.SHOPIFY_ACCESS_TOKEN) {
        setShopifyStatus("error")
        setErrorDetails("Faltan variables de entorno necesarias para la conexión con Shopify")
        setIsChecking(false)
        return
      }

      // Paso 2: Verificar conexión básica
      const basicResponse = await fetch("/api/shopify")
      const basicData = await basicResponse.json()

      setTestResults((prev) => [
        ...prev,
        {
          name: "Conexión básica",
          status: basicResponse.ok ? "success" : "error",
          message: basicResponse.ok
            ? "Conexión básica establecida correctamente"
            : `Error en la conexión básica: ${basicData.error || basicResponse.statusText}`,
        },
      ])

      if (!basicResponse.ok) {
        setShopifyStatus("error")
        setErrorDetails(basicData.error || "Error en la conexión básica con Shopify")
        setIsChecking(false)
        return
      }

      // Paso 3: Probar consulta GraphQL
      const graphqlResponse = await fetch("/api/shopify/test-connection")
      const graphqlData = await graphqlResponse.json()

      setTestResults((prev) => [
        ...prev,
        {
          name: "Consulta GraphQL",
          status: graphqlResponse.ok && graphqlData.success ? "success" : "error",
          message:
            graphqlResponse.ok && graphqlData.success
              ? "Consulta GraphQL ejecutada correctamente"
              : `Error en la consulta GraphQL: ${graphqlData.error || "Error desconocido"}`,
        },
      ])

      if (!graphqlResponse.ok || !graphqlData.success) {
        setShopifyStatus("error")
        setErrorDetails(graphqlData.error || "Error en la consulta GraphQL a Shopify")
        setIsChecking(false)
        return
      }

      // Paso 4: Probar obtención de productos
      const productsResponse = await fetch("/api/shopify/products?limit=1")
      const productsData = await productsResponse.json()

      setTestResults((prev) => [
        ...prev,
        {
          name: "Obtención de productos",
          status: productsResponse.ok && productsData.success ? "success" : "error",
          message:
            productsResponse.ok && productsData.success
              ? `Se obtuvieron ${productsData.data?.length || 0} productos correctamente`
              : `Error al obtener productos: ${productsData.error || "Error desconocido"}`,
        },
      ])

      // Paso 5: Probar obtención de colecciones
      const collectionsResponse = await fetch("/api/shopify/collections?limit=1")
      const collectionsData = await collectionsResponse.json()

      setTestResults((prev) => [
        ...prev,
        {
          name: "Obtención de colecciones",
          status: collectionsResponse.ok && collectionsData.success ? "success" : "error",
          message:
            collectionsResponse.ok && collectionsData.success
              ? `Se obtuvieron ${collectionsData.data?.length || 0} colecciones correctamente`
              : `Error al obtener colecciones: ${collectionsData.error || "Error desconocido"}`,
        },
      ])

      // Determinar estado general
      const hasErrors = testResults.some((test) => test.status === "error")

      if (hasErrors) {
        setShopifyStatus("error")
        setErrorDetails("Se encontraron errores en algunas pruebas")
      } else {
        setShopifyStatus("success")
        setShopInfo(graphqlData.data?.shop)
        toast({
          title: "Diagnóstico completado",
          description: "Todas las pruebas se completaron correctamente",
        })
      }
    } catch (error) {
      setShopifyStatus("error")
      setErrorDetails(error instanceof Error ? error.message : "Error desconocido")
      toast({
        variant: "destructive",
        title: "Error en el diagnóstico",
        description: "Ocurrió un error al realizar las pruebas",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico de Shopify</h1>
        <p className="text-muted-foreground">Verifica y soluciona problemas de conexión con Shopify</p>
      </div>

      <Tabs defaultValue="diagnostico">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Estado de la conexión
                {shopifyStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {shopifyStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
              <CardDescription>Ejecuta un diagnóstico completo de la conexión con Shopify</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Variables de entorno:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm font-mono">NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</span>
                    <Badge variant={envVars.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "default" : "destructive"}>
                      {envVars.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm font-mono">SHOPIFY_ACCESS_TOKEN</span>
                    <Badge variant={envVars.SHOPIFY_ACCESS_TOKEN ? "default" : "destructive"}>
                      {envVars.SHOPIFY_ACCESS_TOKEN ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </div>

              {shopifyStatus === "error" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription>
                    {errorDetails || "No se pudo conectar con Shopify. Verifica tus credenciales."}
                  </AlertDescription>
                </Alert>
              )}

              {shopifyStatus === "success" && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Conexión exitosa</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Conectado correctamente a la tienda {shopInfo?.name || "Shopify"}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-sm font-medium">Resultados de las pruebas:</h3>
                  {testResults.map((test, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                      {test.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-sm font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Solución de problemas comunes</h3>
                    <ul className="mt-2 space-y-2 text-sm text-amber-700">
                      <li className="flex gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Verifica que el dominio de la tienda sea correcto y no incluya "https://"</span>
                      </li>
                      <li className="flex gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Asegúrate de que el token de acceso tenga los permisos necesarios</span>
                      </li>
                      <li className="flex gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Verifica que el token de acceso no haya expirado</span>
                      </li>
                      <li className="flex gap-2">
                        <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>Comprueba que las variables de entorno estén correctamente configuradas</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={runShopifyTest} disabled={isChecking} className="w-full">
                {isChecking ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Ejecutando diagnóstico...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ejecutar diagnóstico completo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion">
          <ShopifyConfigChecker />
        </TabsContent>
      </Tabs>
    </div>
  )
}
