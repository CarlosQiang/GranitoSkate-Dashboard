"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, Database, Bug } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SincronizacionProductos() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  const [responseDetails, setResponseDetails] = useState<any>(null)

  const sincronizarProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebug(null)
      setResponseDetails(null)

      console.log("Iniciando sincronización de productos...")

      // Intentar con la ruta en inglés
      console.log("Intentando sincronizar con /api/shopify/products?limit=1...")

      let response = await fetch("/api/shopify/products?limit=1", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Capturar detalles de la respuesta para depuración
      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        url: response.url,
      }

      console.log("Respuesta recibida:", responseInfo)
      setResponseDetails(responseInfo)

      // Si falla, intentar con otra ruta
      if (!response.ok) {
        console.log("Ruta /api/shopify/products falló, intentando con /api/sync/products")
        response = await fetch("/api/sync/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // Actualizar detalles de la respuesta
        const newResponseInfo = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          url: response.url,
        }

        console.log("Nueva respuesta recibida:", newResponseInfo)
        setResponseDetails((prev) => ({ ...prev, secondAttempt: newResponseInfo }))
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No se pudo leer el cuerpo de la respuesta")
        let errorData

        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }

        console.error("Error en la respuesta:", errorData)
        setDebug({ errorResponse: errorData })

        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Datos recibidos:", data)

      setResultado(data.resultados || data)
      setDebug({ responseData: data })
    } catch (err) {
      console.error("Error al sincronizar productos:", err)
      setError(err.message || "Error desconocido al sincronizar productos")
    } finally {
      setLoading(false)
    }
  }

  const probarConexionShopify = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebug(null)

      console.log("Probando conexión con Shopify...")

      const response = await fetch("/api/shopify/test-connection", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resultado de la prueba de conexión:", data)

      setDebug({ shopifyConnection: data })

      if (!data.success) {
        setError(`Error de conexión con Shopify: ${data.error || "Error desconocido"}`)
      } else {
        setError(null)
      }
    } catch (err) {
      console.error("Error al probar conexión con Shopify:", err)
      setError(err.message || "Error desconocido al probar conexión con Shopify")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sincronización de Productos
        </CardTitle>
        <CardDescription>Sincroniza productos desde tu tienda Shopify a la base de datos local</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert variant={resultado.errores > 0 ? "warning" : "success"} className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sincronización completada</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {resultado.total !== undefined && (
                  <p>
                    Total procesados: <strong>{resultado.total}</strong>
                  </p>
                )}
                {resultado.creados !== undefined && (
                  <p>
                    Productos creados: <strong>{resultado.creados}</strong>
                  </p>
                )}
                {resultado.actualizados !== undefined && (
                  <p>
                    Productos actualizados: <strong>{resultado.actualizados}</strong>
                  </p>
                )}
                {resultado.errores !== undefined && (
                  <p>
                    Errores: <strong>{resultado.errores}</strong>
                  </p>
                )}
              </div>

              {resultado.detalles && resultado.detalles.length > 0 && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="detalles">
                    <AccordionTrigger>Ver detalles</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        {resultado.detalles.map((detalle: any, index: number) => (
                          <div
                            key={index}
                            className={`p-2 rounded ${detalle.resultado === "exito" ? "bg-green-50" : "bg-red-50"}`}
                          >
                            <p>
                              <strong>ID:</strong> {detalle.id}
                            </p>
                            <p>
                              <strong>Título:</strong> {detalle.titulo}
                            </p>
                            <p>
                              <strong>Resultado:</strong> {detalle.resultado}
                            </p>
                            {detalle.mensaje && (
                              <p>
                                <strong>Mensaje:</strong> {detalle.mensaje}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </AlertDescription>
          </Alert>
        )}

        {(debug || responseDetails) && (
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="debug">
              <AccordionTrigger className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bug className="h-4 w-4" />
                  Información de depuración
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {responseDetails && (
                  <div className="mb-2">
                    <h4 className="font-medium text-sm mb-1">Detalles de la respuesta:</h4>
                    <pre className="text-xs overflow-auto p-2 bg-slate-50 rounded max-h-40">
                      {JSON.stringify(responseDetails, null, 2)}
                    </pre>
                  </div>
                )}
                {debug && (
                  <pre className="text-xs overflow-auto p-2 bg-slate-50 rounded max-h-60">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Esta herramienta te permite sincronizar productos desde tu tienda Shopify a la base de datos local. Los
          productos sincronizados aparecerán en la tabla de productos de la base de datos.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={sincronizarProductos} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Sincronizar Productos desde Shopify
            </>
          )}
        </Button>
        <Button onClick={probarConexionShopify} variant="outline" size="sm" className="w-full">
          <Bug className="mr-2 h-4 w-4" />
          Probar Conexión con Shopify
        </Button>
      </CardFooter>
    </Card>
  )
}
