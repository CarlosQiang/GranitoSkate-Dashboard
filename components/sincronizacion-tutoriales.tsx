"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Info } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function SincronizacionTutoriales() {
  const [sincronizando, setSincronizando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [detallesError, setDetallesError] = useState<string | null>(null)
  const [sincronizacionInicial, setSincronizacionInicial] = useState(true)

  // Ejecutar sincronización al cargar el componente
  useEffect(() => {
    if (sincronizacionInicial) {
      sincronizarTutoriales()
      setSincronizacionInicial(false)
    }
  }, [sincronizacionInicial])

  const sincronizarTutoriales = async () => {
    try {
      setSincronizando(true)
      setError(null)
      setDetallesError(null)
      setResultado(null)

      const response = await fetch("/api/tutoriales/sincronizar-todos", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      const data = await response.json().catch(() => ({
        success: false,
        message: "Error al procesar la respuesta",
      }))

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

  const verificarCredenciales = () => {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    if (!shopifyDomain) {
      return (
        <Alert variant="warning" className="mt-2">
          <Info className="h-4 w-4" />
          <AlertTitle>Configuración incompleta</AlertTitle>
          <AlertDescription>
            No se ha configurado el dominio de Shopify. Verifica la variable de entorno NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN.
          </AlertDescription>
        </Alert>
      )
    }
    return null
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
        {verificarCredenciales()}

        {sincronizando ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Sincronizando tutoriales...</p>
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
                <li>Comprueba la conexión a internet</li>
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
                  <div className="text-xs font-medium text-muted-foreground">Total en BD</div>
                  <div className="text-2xl font-bold">{resultado.stats.totalDB}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Total en Shopify</div>
                  <div className="text-2xl font-bold">{resultado.stats.totalShopify}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Creados en BD</div>
                  <div className="text-2xl font-bold">{resultado.stats.creadosEnDB}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Creados en Shopify</div>
                  <div className="text-2xl font-bold">{resultado.stats.creadosEnShopify}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Actualizados</div>
                  <div className="text-2xl font-bold">{resultado.stats.actualizados}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Errores</div>
                  <div className="text-2xl font-bold">{resultado.stats.errores}</div>
                </div>
              </div>
            )}

            {resultado.errores && resultado.errores.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Detalles de errores:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {resultado.errores.map((err: any, index: number) => (
                    <div key={index} className="text-xs border rounded p-2">
                      <Badge variant="outline" className="mb-1">
                        {err.tipo === "shopify_a_db"
                          ? "Shopify → BD"
                          : err.tipo === "db_a_shopify"
                            ? "BD → Shopify"
                            : "Actualización"}
                      </Badge>
                      <p>
                        <strong>{err.tutorial || err.producto}</strong>: {err.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">No se ha realizado ninguna sincronización aún.</p>
            <p className="text-xs text-muted-foreground">
              La sincronización mantiene actualizados los tutoriales entre la base de datos y Shopify.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={sincronizarTutoriales} disabled={sincronizando} className="w-full">
          {sincronizando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {sincronizando ? "Sincronizando..." : "Sincronizar Ahora"}
        </Button>
      </CardFooter>
    </Card>
  )
}
