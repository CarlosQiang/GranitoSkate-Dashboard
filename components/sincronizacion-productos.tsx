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

  const verificarShopify = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebug(null)

      console.log("Verificando conexión con Shopify...")

      const response = await fetch("/api/debug/shopify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resultado de la verificación:", data)

      setDebug(data)

      if (data.shopify?.error) {
        setError(`Error de conexión con Shopify: ${data.shopify.error.message}`)
      } else if (!data.shopify?.response?.data?.shop) {
        setError("No se pudo obtener información de la tienda Shopify")
      } else {
        setError(null)
      }
    } catch (err) {
      console.error("Error al verificar Shopify:", err)
      setError(err.message || "Error desconocido al verificar Shopify")
    } finally {
      setLoading(false)
    }
  }

  const sincronizarProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebug(null)

      console.log("Iniciando sincronización de productos...")

      const response = await fetch("/api/sync/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Capturar el texto de la respuesta para depuración
      const responseText = await response.text()
      console.log("Respuesta recibida (texto):", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Error al parsear la respuesta: ${responseText}`)
      }

      console.log("Respuesta parseada:", data)

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`)
      }

      setResultado(data)
      setDebug({ responseData: data })
    } catch (err) {
      console.error("Error al sincronizar productos:", err)
      setError(err.message || "Error desconocido al sincronizar productos")
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
          <Alert variant={resultado.success ? "success" : "warning"} className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Resultado</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Mensaje:</strong> {resultado.message}
                </p>
                {resultado.productos && (
                  <p>
                    <strong>Productos obtenidos:</strong> {resultado.productos.length}
                  </p>
                )}
              </div>

              {resultado.productos && resultado.productos.length > 0 && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="productos">
                    <AccordionTrigger>Ver productos</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        {resultado.productos.map((producto: any, index: number) => (
                          <div key={index} className="p-2 rounded bg-green-50">
                            <p>
                              <strong>ID:</strong> {producto.id}
                            </p>
                            <p>
                              <strong>Título:</strong> {producto.title}
                            </p>
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

        {debug && (
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="debug">
              <AccordionTrigger className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bug className="h-4 w-4" />
                  Información de depuración
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs overflow-auto p-2 bg-slate-50 rounded max-h-60">
                  {JSON.stringify(debug, null, 2)}
                </pre>
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
        <Button onClick={verificarShopify} variant="outline" size="sm" className="w-full">
          <Bug className="mr-2 h-4 w-4" />
          Verificar Conexión con Shopify
        </Button>
      </CardFooter>
    </Card>
  )
}
