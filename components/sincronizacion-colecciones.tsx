"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, RefreshCw, Database, Cloud } from "lucide-react"

export default function SincronizacionColecciones() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [syncMode, setSyncMode] = useState<"cache" | "database">("cache")
  const [progress, setProgress] = useState(0)

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(10)

    try {
      const response = await fetch(`/api/sync/collections?mode=${syncMode}&limit=50`)
      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProgress(100)

      if (data.success) {
        setSuccess(data.message)
        if (data.collections) {
          setCollections(data.collections)
        }
      } else {
        throw new Error(data.error || "Error desconocido en la sincronización")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
      // Resetear la barra de progreso después de un tiempo
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sincronización de Colecciones
        </CardTitle>
        <CardDescription>
          Obtén las colecciones más recientes de tu tienda Shopify y guárdalas en el sistema
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="cache" onValueChange={(value) => setSyncMode(value as "cache" | "database")}>
          <TabsList className="mb-4">
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Caché Temporal
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de Datos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cache">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Modo Caché</AlertTitle>
              <AlertDescription>
                Las colecciones se obtendrán de Shopify y se almacenarán temporalmente en memoria. No se guardarán en la
                base de datos.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="database">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>Modo Base de Datos</AlertTitle>
              <AlertDescription>
                Las colecciones se obtendrán de Shopify y se guardarán permanentemente en la base de datos. Este proceso
                puede tardar más tiempo.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {progress > 0 && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {progress < 100 ? "Sincronizando..." : "¡Sincronización completada!"}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Éxito</AlertTitle>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {collections.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Colecciones obtenidas ({collections.length})</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {collections.map((collection, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1 truncate">{collection.title}</div>
                  <Badge>{collection.productsCount} productos</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleSync} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sincronizar Colecciones
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
