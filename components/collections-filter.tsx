"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CollectionsFilter({ onFilter }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("title-asc")

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    applyFilters(e.target.value, sortBy)
  }

  const handleSort = (value) => {
    setSortBy(value)
    applyFilters(searchTerm, value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    applyFilters("", sortBy)
  }

  const applyFilters = (search, sort) => {
    onFilter({
      searchTerm: search,
      sortBy: sort,
    })
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search-collections" className="mb-2 block">
            Buscar colecciones
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-collections"
              placeholder="Buscar por nombre..."
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
          <Label htmlFor="sort-collections" className="mb-2 block">
            Ordenar por
          </Label>
          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger id="sort-collections">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Nombre (A-Z)</SelectItem>
              <SelectItem value="title-desc">Nombre (Z-A)</SelectItem>
              <SelectItem value="products-desc">Más productos</SelectItem>
              <SelectItem value="products-asc">Menos productos</SelectItem>
              <SelectItem value="updated-desc">Recién actualizadas</SelectItem>
              <SelectItem value="updated-asc">Menos recientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
