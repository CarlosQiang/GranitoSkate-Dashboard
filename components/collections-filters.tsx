"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, Package, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

interface CollectionsFiltersProps {
  onFiltersChange: (filters: CollectionFilters) => void
  totalCollections: number
  filteredCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export interface CollectionFilters {
  search: string
  productSearch: string
  sortBy: "name" | "products" | "created" | "updated"
  sortOrder: "asc" | "desc"
  hasProducts: "all" | "with" | "without"
  productCountRange: {
    min: number | null
    max: number | null
  }
  status: "all" | "published" | "draft"
}

const defaultFilters: CollectionFilters = {
  search: "",
  productSearch: "",
  sortBy: "name",
  sortOrder: "asc",
  hasProducts: "all",
  productCountRange: {
    min: null,
    max: null,
  },
  status: "all",
}

export function CollectionsFilters({
  onFiltersChange,
  totalCollections,
  filteredCount,
  viewMode,
  onViewModeChange,
}: CollectionsFiltersProps) {
  const [filters, setFilters] = useState<CollectionFilters>(defaultFilters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof CollectionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateProductCountRange = (type: "min" | "max", value: string) => {
    const numValue = value === "" ? null : Number.parseInt(value)
    setFilters((prev) => ({
      ...prev,
      productCountRange: {
        ...prev.productCountRange,
        [type]: numValue,
      },
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const hasActiveFilters = () => {
    return (
      filters.search !== "" ||
      filters.productSearch !== "" ||
      filters.hasProducts !== "all" ||
      filters.status !== "all" ||
      filters.productCountRange.min !== null ||
      filters.productCountRange.max !== null ||
      filters.sortBy !== "name" ||
      filters.sortOrder !== "asc"
    )
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.productSearch) count++
    if (filters.hasProducts !== "all") count++
    if (filters.status !== "all") count++
    if (filters.productCountRange.min !== null || filters.productCountRange.max !== null) count++
    if (filters.sortBy !== "name" || filters.sortOrder !== "asc") count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal y controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar colecciones..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Contador de resultados */}
          <span className="text-sm text-gray-500">
            {filteredCount} de {totalCollections} colecciones
          </span>

          {/* Ordenamiento */}
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [typeof filters.sortBy, typeof filters.sortOrder]
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }))
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="products-desc">Más productos</SelectItem>
              <SelectItem value="products-asc">Menos productos</SelectItem>
              <SelectItem value="created-desc">Más recientes</SelectItem>
              <SelectItem value="created-asc">Más antiguos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtros avanzados */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters() && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros avanzados</h4>
                  {hasActiveFilters() && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                      Limpiar todo
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Búsqueda por producto */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Buscar producto en colecciones</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Nombre del producto..."
                      value={filters.productSearch}
                      onChange={(e) => updateFilter("productSearch", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Encuentra en qué colecciones está un producto específico</p>
                </div>

                <Separator />

                {/* Estado de productos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Productos en colección</Label>
                  <Select
                    value={filters.hasProducts}
                    onValueChange={(value: typeof filters.hasProducts) => updateFilter("hasProducts", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las colecciones</SelectItem>
                      <SelectItem value="with">Con productos</SelectItem>
                      <SelectItem value="without">Sin productos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rango de productos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Número de productos</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={filters.productCountRange.min || ""}
                      onChange={(e) => updateProductCountRange("min", e.target.value)}
                      className="w-20"
                      min="0"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={filters.productCountRange.max || ""}
                      onChange={(e) => updateProductCountRange("max", e.target.value)}
                      className="w-20"
                      min="0"
                    />
                  </div>
                </div>

                {/* Estado de publicación */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: typeof filters.status) => updateFilter("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="published">Publicadas</SelectItem>
                      <SelectItem value="draft">Borradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Selector de vista */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Filtros activos:</span>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{filters.search}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("search", "")} />
            </Badge>
          )}

          {filters.productSearch && (
            <Badge variant="secondary" className="gap-1">
              Producto: "{filters.productSearch}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("productSearch", "")} />
            </Badge>
          )}

          {filters.hasProducts !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.hasProducts === "with" ? "Con productos" : "Sin productos"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("hasProducts", "all")} />
            </Badge>
          )}

          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === "published" ? "Publicadas" : "Borradores"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("status", "all")} />
            </Badge>
          )}

          {(filters.productCountRange.min !== null || filters.productCountRange.max !== null) && (
            <Badge variant="secondary" className="gap-1">
              Productos: {filters.productCountRange.min || 0}-{filters.productCountRange.max || "∞"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter("productCountRange", { min: null, max: null })}
              />
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  )
}
