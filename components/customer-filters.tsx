"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface CustomerFilter {
  query?: string
  sortKey?: string
  reverse?: boolean
  dateFrom?: Date | null
  dateTo?: Date | null
  hasOrders?: boolean | null
  hasVerifiedEmail?: boolean | null
  tags?: string[]
  hasDNI?: boolean | null
}

interface CustomerFiltersProps {
  filters: CustomerFilter
  onFilterChange: (filters: CustomerFilter) => void
  onReset: () => void
}

export function CustomerFilters({ filters, onFilterChange, onReset }: CustomerFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<CustomerFilter>(filters)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      query: e.target.value,
    })
  }

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sortKey: value,
    })
  }

  const handleOrderChange = (value: string) => {
    onFilterChange({
      ...filters,
      reverse: value === "desc",
    })
  }

  const handleAdvancedFilterChange = (key: string, value: any) => {
    setLocalFilters({
      ...localFilters,
      [key]: value,
    })
  }

  const applyAdvancedFilters = () => {
    onFilterChange({
      ...filters,
      ...localFilters,
    })
    setIsAdvancedOpen(false)
  }

  const hasActiveFilters = () => {
    return (
      filters.dateFrom !== null ||
      filters.dateTo !== null ||
      filters.hasOrders !== null ||
      filters.hasVerifiedEmail !== null ||
      filters.hasDNI !== null ||
      (filters.tags && filters.tags.length > 0)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nombre, email, teléfono o DNI..."
            value={filters.query || ""}
            onChange={handleInputChange}
            className="w-full"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => onFilterChange({ ...filters, query: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={filters.sortKey || "CREATED_AT"} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATED_AT">Fecha de registro</SelectItem>
              <SelectItem value="UPDATED_AT">Última actualización</SelectItem>
              <SelectItem value="LAST_ORDER_DATE">Último pedido</SelectItem>
              <SelectItem value="NAME">Nombre</SelectItem>
              <SelectItem value="TOTAL_SPENT">Total gastado</SelectItem>
              <SelectItem value="ORDERS_COUNT">Número de pedidos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.reverse ? "desc" : "asc"} onValueChange={handleOrderChange}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros avanzados</span>
                <span className="sm:hidden">Filtros</span>
                {hasActiveFilters() && (
                  <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Filtros avanzados</DialogTitle>
                <DialogDescription>
                  Configura filtros adicionales para encontrar clientes específicos.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Desde fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localFilters.dateFrom && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.dateFrom ? (
                            format(localFilters.dateFrom, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={localFilters.dateFrom || undefined}
                          onSelect={(date) => handleAdvancedFilterChange("dateFrom", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Hasta fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localFilters.dateTo && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localFilters.dateTo ? (
                            format(localFilters.dateTo, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={localFilters.dateTo || undefined}
                          onSelect={(date) => handleAdvancedFilterChange("dateTo", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pedidos</Label>
                    <Select
                      value={localFilters.hasOrders === null ? "any" : localFilters.hasOrders ? "yes" : "no"}
                      onValueChange={(value) =>
                        handleAdvancedFilterChange("hasOrders", value === "any" ? null : value === "yes")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cualquiera</SelectItem>
                        <SelectItem value="yes">Con pedidos</SelectItem>
                        <SelectItem value="no">Sin pedidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email verificado</Label>
                    <Select
                      value={
                        localFilters.hasVerifiedEmail === null ? "any" : localFilters.hasVerifiedEmail ? "yes" : "no"
                      }
                      onValueChange={(value) =>
                        handleAdvancedFilterChange("hasVerifiedEmail", value === "any" ? null : value === "yes")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cualquiera</SelectItem>
                        <SelectItem value="yes">Verificado</SelectItem>
                        <SelectItem value="no">No verificado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>DNI registrado</Label>
                    <Select
                      value={localFilters.hasDNI === null ? "any" : localFilters.hasDNI ? "yes" : "no"}
                      onValueChange={(value) =>
                        handleAdvancedFilterChange("hasDNI", value === "any" ? null : value === "yes")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cualquiera</SelectItem>
                        <SelectItem value="yes">Con DNI</SelectItem>
                        <SelectItem value="no">Sin DNI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
                    <Input
                      id="tags"
                      placeholder="ej: vip, newsletter"
                      value={localFilters.tags?.join(", ") || ""}
                      onChange={(e) => {
                        const tagsValue = e.target.value.trim()
                        const tags = tagsValue ? tagsValue.split(",").map((t) => t.trim()) : []
                        handleAdvancedFilterChange("tags", tags)
                      }}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocalFilters({})
                    onReset()
                    setIsAdvancedOpen(false)
                  }}
                  className="w-full sm:w-auto"
                >
                  Restablecer
                </Button>
                <Button onClick={applyAdvancedFilters} className="w-full sm:w-auto">
                  Aplicar filtros
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.dateFrom && (
            <Badge onRemove={() => onFilterChange({ ...filters, dateFrom: null })}>
              Desde: {format(filters.dateFrom, "dd/MM/yyyy")}
            </Badge>
          )}

          {filters.dateTo && (
            <Badge onRemove={() => onFilterChange({ ...filters, dateTo: null })}>
              Hasta: {format(filters.dateTo, "dd/MM/yyyy")}
            </Badge>
          )}

          {filters.hasOrders !== null && (
            <Badge onRemove={() => onFilterChange({ ...filters, hasOrders: null })}>
              {filters.hasOrders ? "Con pedidos" : "Sin pedidos"}
            </Badge>
          )}

          {filters.hasVerifiedEmail !== null && (
            <Badge onRemove={() => onFilterChange({ ...filters, hasVerifiedEmail: null })}>
              {filters.hasVerifiedEmail ? "Email verificado" : "Email no verificado"}
            </Badge>
          )}

          {filters.hasDNI !== null && (
            <Badge onRemove={() => onFilterChange({ ...filters, hasDNI: null })}>
              {filters.hasDNI ? "Con DNI" : "Sin DNI"}
            </Badge>
          )}

          {filters.tags &&
            filters.tags.map((tag) => (
              <Badge
                key={tag}
                onRemove={() =>
                  onFilterChange({
                    ...filters,
                    tags: filters.tags?.filter((t) => t !== tag),
                  })
                }
              >
                Etiqueta: {tag}
              </Badge>
            ))}

          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onReset}>
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  onRemove: () => void
}

function Badge({ children, onRemove }: BadgeProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
      {children}
      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-secondary-foreground/20" onClick={onRemove}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
