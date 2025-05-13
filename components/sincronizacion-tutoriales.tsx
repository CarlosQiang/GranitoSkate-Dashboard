"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SincronizacionTutoriales() {
  const [sincronizando, setSincronizando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [detallesError, setDetallesError] = useState<string | null>(null)
  const [sincronizacionInicial, setSincronizacionInicial] = useState(false) // Cambiado a false para evitar sincronización automática
  const [coleccionId, setColeccionId] = useState<string | null>(null)
  const [verificandoColeccion, setVerificandoColeccion] = useState(false)

  // Verificar la colección al cargar el componente
  useEffect(() => {
    verificarColeccion()
  }, [])

  const verificarColeccion = async () => {
    try {
      setVerificandoColeccion(true)
      setError(null)

      const response = await fetch("/api/shopify/get-collection-id", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`)
      }

      if (data.success) {
        setColeccionId(data.collectionId)
        console.log("Colección verificada:", data.collectionId)
      } else {
        throw new Error(data.message || "No se pudo verificar la colección")
      }
    } catch (err) {
      console.error("Error al verificar colección:", err)
      setError(`Error al verificar colección: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setVerificandoColeccion(false)
    }
  }

  const sincronizarTutoriales = async () => {
    try {
      setSincronizando(true)
      setError(null)
      setDetallesError(null)
      setResultado(null)

      console.log("Iniciando solicitud de sincronización...")

      const response = await fetch("/api/tutoriales/sincronizar-todos", {
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
        setError(data.message || "Error en la sincronización")
        if (data.error) {
          setDetallesError(JSON.stringify(data.error, null, 2))
        }
      }
    } catch (err) {
      console.error("Error al sincronizar tutoriales:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronización de Tutoriales
        </CardTitle>
        <CardDescription>Mantén sincronizados los tutoriales entre la base de datos y Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {verificandoColeccion ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Verificando colección de tutoriales...</p>
          </div>
        ) : coleccionId ? (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Colección verificada</AlertTitle>
            <AlertDescription>
              La colección "Tutoriales" ha sido encontrada en Shopify. ID: {coleccionId}
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al verificar colección</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {sincronizando ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Sincronizando tutoriales...</p>
          </div>
        ) : error && !coleccionId ? (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
              <p className="font-medium text-amber-800">Sugerencias para solucionar el problema:</p>
              <ul className="list-disc pl-5 mt-1 text-amber-700 space-y-1">
                <li>Verifica que las credenciales de Shopify estén configuradas correctamente</li>
                <li>Asegúrate de que el token de acceso tenga los permisos necesarios</li>
                <li>Comprueba que la colección "Tutoriales" exista en tu tienda Shopify</li>
                <li>Verifica que la tienda Shopify esté activa</li>
              </ul>
            </div>

            <Button onClick={verificarColeccion} variant="outline" className="w-full mt-2">
              Verificar colección de nuevo
            </Button>
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
              <AlertTitle>{resultado.success ? "Sincronización completada" : "Error en la sincronización"}</AlertTitle>
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

            {resultado.detalles && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">Ver detalles de la sincronización</AccordionTrigger>
                  <AccordionContent>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {resultado.detalles.map((resultado: any, index: number) => (
                        <div
                          key={index}
                          className={`text-xs border rounded p-2 ${
                            resultado.status === "fulfilled" && resultado.value.success
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <Badge
                            variant={
                              resultado.status === "fulfilled" && resultado.value.success ? "outline" : "destructive"
                            }
                            className="mb-1"
                          >
                            {resultado.status === "fulfilled" && resultado.value.success ? "Éxito" : "Error"}
                          </Badge>
                          <p>
                            <strong>{resultado.value?.titulo || `ID: ${resultado.value?.id || "Desconocido"}`}</strong>
                            {resultado.status !== "fulfilled" || !resultado.value.success
                              ? `: ${resultado.reason?.message || resultado.value?.error || "Error desconocido"}`
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
            <p className="text-sm text-muted-foreground mb-2">
              {coleccionId
                ? "Listo para sincronizar tutoriales con Shopify."
                : "Verifica la colección antes de sincronizar."}
            </p>
            <p className="text-xs text-muted-foreground">
              La sincronización mantiene actualizados los tutoriales entre la base de datos y Shopify.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={coleccionId ? sincronizarTutoriales : verificarColeccion}
          disabled={sincronizando || verificandoColeccion}
          className="w-full"
        >
          {(sincronizando || verificandoColeccion) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {sincronizando
            ? "Sincronizando..."
            : verificandoColeccion
              ? "Verificando..."
              : coleccionId
                ? "Sincronizar Ahora"
                : "Verificar Colección"}
        </Button>
      </CardFooter>
    </Card>
  )
}
