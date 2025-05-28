"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface CollectionFilters {
  search: string
  productSearch: string
  sortBy: "name" | "products" | "created" | "updated"
  sortOrder: "asc" | "desc"
  hasProducts: "all" | "with" | "without"
  productCountRange: { min: number | null; max: number | null }
  status: "all" | "published" | "unpublished"
}

interface CollectionsFiltersProps {
  onFiltersChange: (filters: CollectionFilters) => void
  totalCollections: number
  filteredCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function CollectionsFilters({
  onFiltersChange,
  totalCollections,
  filteredCount,
  viewMode,
  onViewModeChange,
}: CollectionsFiltersProps) {
  const [filters, setFilters] = useState<CollectionFilters>({
    search: "",
    productSearch: "",
    sortBy: "name",
    sortOrder: "asc",
    hasProducts: "all",
    productCountRange: { min: null, max: null },
    status: "all",
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateFilters = (newFilters: Partial<CollectionFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const defaultFilters: CollectionFilters = {
      search: "",
      productSearch: "",
      sortBy: "name",
      sortOrder: "asc",
      hasProducts: "all",
      productCountRange: { min: null, max: null },
      status: "all",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.productSearch !== "" ||
    filters.hasProducts !== "all" ||
    filters.productCountRange.min !== null ||
    filters.productCountRange.max !== null ||
    filters.status !== "all"

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal y controles */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-2xl">
          {/* Búsqueda de colecciones */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar colecciones por nombre..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Búsqueda de productos dentro de colecciones */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos en colecciones..."
              className="pl-8"
              value={filters.productSearch}
              onChange={(e) => updateFilters({ productSearch: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros avanzados */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros avanzados</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Ordenamiento */}
                <div className="space-y-2">
                  <Label>Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters({ sortBy: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="products">Nº Productos</SelectItem>
                        <SelectItem value="created">Fecha creación</SelectItem>
                        <SelectItem value="updated">Última actualización</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: any) => updateFilters({ sortOrder: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">A-Z</SelectItem>
                        <SelectItem value="desc">Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filtro por productos */}
                <div className="space-y-2">
                  <Label>Productos</Label>
                  <Select
                    value={filters.hasProducts}
                    onValueChange={(value: any) => updateFilters({ hasProducts: value })}
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
                  <Label>Rango de productos</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={filters.productCountRange.min || ""}
                      onChange={(e) =>
                        updateFilters({
                          productCountRange: {
                            ...filters.productCountRange,
                            min: e.target.value ? Number.parseInt(e.target.value) : null,
                          },
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={filters.productCountRange.max || ""}
                      onChange={(e) =>
                        updateFilters({
                          productCountRange: {
                            ...filters.productCountRange,
                            max: e.target.value ? Number.parseInt(e.target.value) : null,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={filters.status} onValueChange={(value: any) => updateFilters({ status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="published">Publicadas</SelectItem>
                      <SelectItem value="unpublished">No publicadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Selector de vista */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={cn("px-2 rounded-none", viewMode === "grid" && "bg-gray-100 dark:bg-gray-800")}
              onClick={() => onViewModeChange("grid")}
              aria-label="Vista de cuadrícula"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("px-2 rounded-none", viewMode === "list" && "bg-gray-100 dark:bg-gray-800")}
              onClick={() => onViewModeChange("list")}
              aria-label="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Indicador de resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {filteredCount} de {totalCollections} colecciones
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Nombre: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ search: "" })} />
            </Badge>
          )}
          {filters.productSearch && (
            <Badge variant="secondary" className="gap-1">
              Producto: {filters.productSearch}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ productSearch: "" })} />
            </Badge>
          )}
          {filters.hasProducts !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.hasProducts === "with" ? "Con productos" : "Sin productos"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ hasProducts: "all" })} />
            </Badge>
          )}
          {(filters.productCountRange.min !== null || filters.productCountRange.max !== null) && (
            <Badge variant="secondary" className="gap-1">
              Productos: {filters.productCountRange.min || 0}-{filters.productCountRange.max || "∞"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ productCountRange: { min: null, max: null } })}
              />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === "published" ? "Publicadas" : "No publicadas"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ status: "all" })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
