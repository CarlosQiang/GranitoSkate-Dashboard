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

  const verificarBaseDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebug(null)

      console.log("Verificando conexión con la base de datos...")

      const response = await fetch("/api/db/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resultado de la verificación de la base de datos:", data)

      setDebug(data)

      if (!data.success) {
        setError(`Error de conexión con la base de datos: ${data.error || "Error desconocido"}`)
      } else {
        setError(null)
        setResultado({
          success: true,
          message: "Conexión a la base de datos establecida correctamente",
          dbInfo: data,
        })
      }
    } catch (err: any) {
      console.error("Error al verificar la base de datos:", err)
      setError(err.message || "Error desconocido al verificar la base de datos")
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

      // Primero verificamos la conexión a la base de datos
      const dbCheckResponse = await fetch("/api/db/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const dbCheckData = await dbCheckResponse.json()
      console.log("Verificación de la base de datos:", dbCheckData)

      if (!dbCheckData.success) {
        throw new Error(`Error de conexión con la base de datos: ${dbCheckData.error || "Error desconocido"}`)
      }

      // Ahora sincronizamos los productos
      const response = await fetch("/api/sync/products?limit=5", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Respuesta de sincronización:", data)

      setResultado(data)
      setDebug({ responseData: data, dbCheck: dbCheckData })
    } catch (err: any) {
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
                {resultado.resultados && (
                  <>
                    <p>
                      <strong>Total procesados:</strong> {resultado.resultados.total}
                    </p>
                    <p>
                      <strong>Creados:</strong> {resultado.resultados.creados}
                    </p>
                    <p>
                      <strong>Actualizados:</strong> {resultado.resultados.actualizados}
                    </p>
                    <p>
                      <strong>Errores:</strong> {resultado.resultados.errores}
                    </p>
                  </>
                )}
                {resultado.dbInfo && (
                  <p>
                    <strong>Base de datos:</strong> Conectada correctamente
                  </p>
                )}
              </div>

              {resultado.resultados?.detalles && resultado.resultados.detalles.length > 0 && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="detalles">
                    <AccordionTrigger>Ver detalles</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        {resultado.resultados.detalles.map((detalle: any, index: number) => (
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
                            {detalle.accion && (
                              <p>
                                <strong>Acción:</strong> {detalle.accion}
                              </p>
                            )}
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
        <Button onClick={verificarBaseDatos} variant="outline" size="sm" className="w-full">
          <Bug className="mr-2 h-4 w-4" />
          Verificar Conexión con Base de Datos
        </Button>
      </CardFooter>
    </Card>
  )
}
