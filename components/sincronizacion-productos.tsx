"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, RefreshCw, Search, ArrowDownUp, Package, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SincronizacionProductos() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [progress, setProgress] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [cacheStats, setCacheStats] = useState<any>(null)

  // Cargar estadísticas de caché al montar el componente
  useEffect(() => {
    fetchCacheStats()
  }, [])

  // Filtrar y ordenar productos cuando cambian los filtros o productos
  useEffect(() => {
    if (!products.length) return

    let filtered = [...products]

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter)
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(term) ||
          product.vendor?.toLowerCase().includes(term) ||
          product.product_type?.toLowerCase().includes(term),
      )
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let valueA = a[sortField] || ""
      let valueB = b[sortField] || ""

      // Convertir a números si es necesario
      if (sortField === "inventory_quantity" || sortField === "price") {
        valueA = Number.parseFloat(valueA) || 0
        valueB = Number.parseFloat(valueB) || 0
      }

      // Ordenar
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredProducts(filtered)
  }, [products, statusFilter, searchTerm, sortField, sortDirection])

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

  // Obtener productos de la caché o de Shopify
  const fetchProducts = async (refresh = false) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(10)

    try {
      const response = await fetch(`/api/cached/products?refresh=${refresh}&transform=true`)
      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProgress(100)

      if (data.success) {
        setProducts(data.data || [])
        setSuccess(`Se obtuvieron ${data.count} productos ${data.fromCache ? "de la caché" : "de Shopify"}`)
        // Actualizar estadísticas de caché
        fetchCacheStats()
      } else {
        throw new Error(data.error || "Error desconocido al obtener productos")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
      // Resetear la barra de progreso después de un tiempo
      setTimeout(() => setProgress(0), 2000)
    }
  }

  // Limpiar la caché
  const handleClearCache = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas limpiar la caché? Esto eliminará todos los datos almacenados temporalmente.",
      )
    ) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/cached/stats", { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setSuccess("Caché limpiada correctamente")
        setProducts([])
        setFilteredProducts([])
        // Actualizar estadísticas de caché
        fetchCacheStats()
      } else {
        throw new Error(data.error || "Error desconocido al limpiar caché")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Renderizar estado de carga
  if (loading && !products.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sincronización de Productos</CardTitle>
          <CardDescription>Cargando productos...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress || 70} className="h-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos de Shopify
            </CardTitle>
            <CardDescription>Gestiona los productos de tu tienda Shopify</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}>
              {viewMode === "grid" ? (
                <>
                  <Table className="h-4 w-4 mr-1" />
                  Tabla
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-1" />
                  Cuadrícula
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Exportar datos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const jsonStr = JSON.stringify(filteredProducts, null, 2)
                    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`
                    const link = document.createElement("a")
                    link.href = dataUri
                    link.download = "productos-shopify.json"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  Exportar como JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Función simple para convertir a CSV
                    const headers = Object.keys(filteredProducts[0] || {}).join(",")
                    const rows = filteredProducts.map((p) =>
                      Object.values(p)
                        .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
                        .join(","),
                    )
                    const csv = [headers, ...rows].join("\n")
                    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
                    const link = document.createElement("a")
                    link.href = dataUri
                    link.download = "productos-shopify.csv"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estadísticas de caché */}
        {cacheStats && (
          <div className="mb-4 p-3 bg-slate-50 rounded-md text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="font-medium">Productos en caché:</span>{" "}
                <Badge variant={cacheStats.products.count > 0 ? "default" : "outline"}>
                  {cacheStats.products.count}
                </Badge>
              </div>
              {cacheStats.products.count > 0 && (
                <div>
                  <span className="font-medium">Última actualización:</span>{" "}
                  <span className="text-slate-600">{new Date(cacheStats.products.lastUpdated).toLocaleString()}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Estado:</span>{" "}
                <Badge variant={cacheStats.products.isValid ? "success" : "destructive"}>
                  {cacheStats.products.isValid ? "Válida" : "Expirada"}
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
              {progress < 100 ? "Obteniendo productos..." : "¡Productos obtenidos!"}
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="DRAFT">Borradores</SelectItem>
              <SelectItem value="ARCHIVED">Archivados</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                <ArrowDownUp className="mr-2 h-4 w-4" />
                Ordenar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSortField("title")
                  setSortDirection(sortField === "title" && sortDirection === "asc" ? "desc" : "asc")
                }}
              >
                Título {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("price")
                  setSortDirection(sortField === "price" && sortDirection === "asc" ? "desc" : "asc")
                }}
              >
                Precio {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("inventory_quantity")
                  setSortDirection(sortField === "inventory_quantity" && sortDirection === "asc" ? "desc" : "asc")
                }}
              >
                Inventario {sortField === "inventory_quantity" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("vendor")
                  setSortDirection(sortField === "vendor" && sortDirection === "asc" ? "desc" : "asc")
                }}
              >
                Proveedor {sortField === "vendor" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortField("product_type")
                  setSortDirection(sortField === "product_type" && sortDirection === "asc" ? "desc" : "asc")
                }}
              >
                Tipo {sortField === "product_type" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Resultados */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No hay productos disponibles</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {products.length > 0
                ? "No se encontraron productos que coincidan con los filtros"
                : "Obtén productos desde Shopify para comenzar"}
            </p>
            <Button onClick={() => fetchProducts(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Obtener productos de Shopify
            </Button>
          </div>
        ) : viewMode === "table" ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Producto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Inventario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Proveedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.shopify_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.featured_image && (
                          <img
                            src={product.featured_image || "/placeholder.svg"}
                            alt={product.title}
                            className="h-8 w-8 object-cover rounded"
                          />
                        )}
                        <span className="truncate max-w-[200px]">{product.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "ACTIVE" ? "default" : product.status === "DRAFT" ? "secondary" : "outline"
                        }
                      >
                        {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number.parseFloat(product.price || 0).toFixed(2)}
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${Number.parseFloat(product.compare_at_price || 0).toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{product.inventory_quantity || 0}</TableCell>
                    <TableCell>
                      <span className="truncate max-w-[150px] inline-block">{product.product_type || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-[150px] inline-block">{product.vendor || "-"}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.shopify_id}
                className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-slate-100 relative">
                  {product.featured_image ? (
                    <img
                      src={product.featured_image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-2 right-2"
                    variant={
                      product.status === "ACTIVE" ? "default" : product.status === "DRAFT" ? "secondary" : "outline"
                    }
                  >
                    {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">{product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="font-bold">${Number.parseFloat(product.price || 0).toFixed(2)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${Number.parseFloat(product.compare_at_price || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">Stock: {product.inventory_quantity || 0}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {product.product_type && <Badge variant="outline">{product.product_type}</Badge>}
                    {product.vendor && <Badge variant="outline">{product.vendor}</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => fetchProducts(true)} disabled={loading} className="w-full sm:w-auto">
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
        <Button onClick={() => fetchProducts(false)} variant="outline" disabled={loading} className="w-full sm:w-auto">
          <Package className="mr-2 h-4 w-4" />
          Usar caché
        </Button>
        <Button onClick={handleClearCache} variant="outline" disabled={loading} className="w-full sm:w-auto">
          Limpiar caché
        </Button>
      </CardFooter>
    </Card>
  )
}
