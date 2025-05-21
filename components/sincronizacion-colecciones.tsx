"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, RefreshCw, Search, FolderOpen } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SincronizacionColecciones() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [filteredCollections, setFilteredCollections] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [progress, setProgress] = useState(0)
  const [cacheStats, setCacheStats] = useState<any>(null)

  // Cargar estadísticas de caché al montar el componente
  useEffect(() => {
    fetchCacheStats()
  }, [])

  // Filtrar colecciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (!collections.length) return

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredCollections(
        collections.filter(
          (collection) =>
            collection.title?.toLowerCase().includes(term) || collection.description?.toLowerCase().includes(term),
        ),
      )
    } else {
      setFilteredCollections(collections)
    }
  }, [collections, searchTerm])

  // Obtener estadísticas de caché
  const fetchCacheStats = async () => {
    try {
      const response = await fetch("/api/cached/stats")
      if (!response.ok) throw new Error("Error al obtener estadísticas de caché")
      const data = await response.json()
      if (data.success) {
        setCacheStats(data.stats)
      }
    } catch (err) {
      console.error("Error al obtener estadísticas de caché:", err)
    }
  }

  // Obtener colecciones de la caché o de Shopify
  const fetchCollections = async (refresh = false) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(10)

    try {
      const response = await fetch(`/api/cached/collections?refresh=${refresh}&transform=true`)
      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProgress(100)

      if (data.success) {
        setCollections(data.data || [])
        setFilteredCollections(data.data || [])
        setSuccess(`Se obtuvieron ${data.count} colecciones ${data.fromCache ? "de la caché" : "de Shopify"}`)
        // Actualizar estadísticas de caché
        fetchCacheStats()
      } else {
        throw new Error(data.error || "Error desconocido al obtener colecciones")
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
          <FolderOpen className="h-5 w-5" />
          Colecciones de Shopify
        </CardTitle>
        <CardDescription>Gestiona las colecciones de tu tienda Shopify</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Estadísticas de caché */}
        {cacheStats && (
          <div className="mb-4 p-3 bg-slate-50 rounded-md text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="font-medium">Colecciones en caché:</span>{" "}
                <Badge variant={cacheStats.collections.count > 0 ? "default" : "outline"}>
                  {cacheStats.collections.count}
                </Badge>
              </div>
              {cacheStats.collections.count > 0 && (
                <div>
                  <span className="font-medium">Última actualización:</span>{" "}
                  <span className="text-slate-600">
                    {new Date(cacheStats.collections.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium">Estado:</span>{" "}
                <Badge variant={cacheStats.collections.isValid ? "success" : "destructive"}>
                  {cacheStats.collections.isValid ? "Válida" : "Expirada"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso */}
        {progress > 0 && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {progress < 100 ? "Obteniendo colecciones..." : "¡Colecciones obtenidas!"}
            </p>
          </div>
        )}

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Éxito</AlertTitle>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar colecciones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Resultados */}
        {filteredCollections.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No hay colecciones disponibles</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {collections.length > 0
                ? "No se encontraron colecciones que coincidan con la búsqueda"
                : "Obtén colecciones desde Shopify para comenzar"}
            </p>
            <Button onClick={() => fetchCollections(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Obtener colecciones de Shopify
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Colección</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead>Handle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((collection) => (
                  <TableRow key={collection.shopify_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {collection.image_url && (
                          <img
                            src={collection.image_url || "/placeholder.svg"}
                            alt={collection.title}
                            className="h-8 w-8 object-cover rounded"
                          />
                        )}
                        <span className="truncate max-w-[200px]">{collection.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{collection.products_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground truncate max-w-[150px] inline-block">
                        {collection.handle}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => fetchCollections(true)} disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Obteniendo...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Obtener de Shopify
            </>
          )}
        </Button>
        <Button
          onClick={() => fetchCollections(false)}
          variant="outline"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Usar caché
        </Button>
      </CardFooter>
    </Card>
  )
}
