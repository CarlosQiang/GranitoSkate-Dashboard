"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductsFilter({ onFilter }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("title-asc")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    applyFilters(e.target.value, sortBy, statusFilter)
  }

  const handleSort = (value) => {
    setSortBy(value)
    applyFilters(searchTerm, value, statusFilter)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    applyFilters(searchTerm, sortBy, value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    applyFilters("", sortBy, statusFilter)
  }

  const applyFilters = (search, sort, status) => {
    onFilter({
      searchTerm: search,
      sortBy: sort,
      status,
    })
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search-products" className="mb-2 block">
            Buscar productos
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-products"
              placeholder="Buscar por nombre, SKU o tipo..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-7 w-7 p-0" onClick={clearSearch}>
                <X className="h-4 w-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="filter-status" className="mb-2 block">
            Estado
          </Label>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="sort-products" className="mb-2 block">
            Ordenar por
          </Label>
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger id="sort-products">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="title-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
              <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
              <SelectItem value="inventory-desc">Más stock</SelectItem>
              <SelectItem value="inventory-asc">Menos stock</SelectItem>
              <SelectItem value="updated-desc">Recién actualizados</SelectItem>
              <SelectItem value="updated-asc">Menos recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
