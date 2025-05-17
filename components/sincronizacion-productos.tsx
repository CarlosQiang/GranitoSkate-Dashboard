"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, Database } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SincronizacionProductos() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sincronizarProductos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar primero con la ruta en inglés
      let response = await fetch("/api/sync/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Si falla, intentar con la ruta en español
      if (!response.ok && response.status === 404) {
        console.log("Ruta /api/sync/products no encontrada, intentando con /api/sync/productos")
        response = await fetch("/api/sync/productos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResultado(data.resultados)
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
          <Alert variant={resultado.errores > 0 ? "warning" : "success"} className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sincronización completada</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p>
                  Total procesados: <strong>{resultado.total}</strong>
                </p>
                <p>
                  Productos creados: <strong>{resultado.creados}</strong>
                </p>
                <p>
                  Productos actualizados: <strong>{resultado.actualizados}</strong>
                </p>
                <p>
                  Errores: <strong>{resultado.errores}</strong>
                </p>
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

        <p className="text-sm text-muted-foreground mb-4">
          Esta herramienta te permite sincronizar productos desde tu tienda Shopify a la base de datos local. Los
          productos sincronizados aparecerán en la tabla de productos de la base de datos.
        </p>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  )
}
