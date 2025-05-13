"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SubirTutorialesShopify() {
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [detallesError, setDetallesError] = useState<string | null>(null)

  const subirTutoriales = async () => {
    try {
      setSubiendo(true)
      setError(null)
      setDetallesError(null)
      setResultado(null)

      console.log("Iniciando solicitud de subida de tutoriales...")

      const response = await fetch("/api/tutoriales/subir-a-shopify", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      console.log("Respuesta recibida:", response.status)

      const data = await response.json().catch(() => ({
        success: false,
        message: "Error al procesar la respuesta",
      }))

      console.log("Datos de respuesta:", data)

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      setResultado(data)

      // Si hay un mensaje de error en la respuesta, mostrarlo aunque el status sea 200
      if (!data.success) {
        setError(data.message || "Error en la subida de tutoriales")
        if (data.error) {
          setDetallesError(JSON.stringify(data.error, null, 2))
        }
      }
    } catch (err) {
      console.error("Error al subir tutoriales:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Tutoriales a Shopify
        </CardTitle>
        <CardDescription>
          Sube directamente los tutoriales como productos a Shopify y añádelos a la colección "Tutoriales"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subiendo ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Subiendo tutoriales a Shopify...</p>
          </div>
        ) : error ? (
          <div className="space-y-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {detallesError && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">Ver detalles técnicos</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">{detallesError}</pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
              <p className="font-medium text-amber-800">Sugerencias para solucionar el problema:</p>
              <ul className="list-disc pl-5 mt-1 text-amber-700 space-y-1">
                <li>Verifica que las credenciales de Shopify estén configuradas correctamente</li>
                <li>Asegúrate de que el token de acceso tenga los permisos necesarios</li>
                <li>Comprueba que la colección "Tutoriales" exista en tu tienda Shopify</li>
                <li>Verifica que la tienda Shopify esté activa</li>
              </ul>
            </div>
          </div>
        ) : resultado ? (
          <div className="space-y-4">
            <Alert variant={resultado.success ? "default" : "destructive"}>
              {resultado.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{resultado.success ? "Subida completada" : "Error en la subida"}</AlertTitle>
              <AlertDescription>{resultado.message}</AlertDescription>
            </Alert>

            {resultado.success && resultado.stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{resultado.stats.total}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Éxitos</div>
                  <div className="text-2xl font-bold">{resultado.stats.exitos}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Errores</div>
                  <div className="text-2xl font-bold">{resultado.stats.errores}</div>
                </div>
              </div>
            )}

            {resultado.resultados && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">Ver detalles de la subida</AccordionTrigger>
                  <AccordionContent>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {resultado.resultados.map((resultado: any, index: number) => (
                        <div
                          key={index}
                          className={`text-xs border rounded p-2 ${
                            resultado.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                          }`}
                        >
                          <Badge variant={resultado.success ? "outline" : "destructive"} className="mb-1">
                            {resultado.success ? resultado.accion : "Error"}
                          </Badge>
                          <p>
                            <strong>{resultado.titulo || `ID: ${resultado.id || "Desconocido"}`}</strong>
                            {!resultado.success
                              ? `: ${resultado.error || "Error desconocido"}`
                              : resultado.shopify_id
                                ? ` (ID: ${resultado.shopify_id.split("/").pop()})`
                                : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Listo para subir tutoriales a Shopify.</p>
            <p className="text-xs text-muted-foreground">
              Este proceso tomará todos los tutoriales publicados en la base de datos y los subirá como productos a
              Shopify, añadiéndolos a la colección "Tutoriales".
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={subirTutoriales} disabled={subiendo} className="w-full">
          {subiendo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {subiendo ? "Subiendo..." : "Subir Tutoriales a Shopify"}
        </Button>
      </CardFooter>
    </Card>
  )
}
