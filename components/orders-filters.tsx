"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X, TrendingDown, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface OrderFilters {
  search: string
  status: string
  sortBy: string
  sortOrder: "asc" | "desc"
  dateFrom: Date | undefined
  dateTo: Date | undefined
  minAmount: string
  maxAmount: string
  period: string
}

interface OrdersFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  onClearFilters: () => void
  totalOrders: number
  totalAmount: number
}

export function OrdersFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalOrders,
  totalAmount,
}: OrdersFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof OrderFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.period !== "all"

  const getQuickDateFilter = (period: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case "today":
        return { dateFrom: today, dateTo: new Date() }
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        return { dateFrom: weekStart, dateTo: new Date() }
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return { dateFrom: monthStart, dateTo: new Date() }
      case "quarter":
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
        return { dateFrom: quarterStart, dateTo: new Date() }
      case "year":
        const yearStart = new Date(today.getFullYear(), 0, 1)
        return { dateFrom: yearStart, dateTo: new Date() }
      default:
        return { dateFrom: undefined, dateTo: undefined }
    }
  }

  const handlePeriodChange = (period: string) => {
    const dates = getQuickDateFilter(period)
    onFiltersChange({
      ...filters,
      period,
      dateFrom: dates.dateFrom,
      dateTo: dates.dateTo,
    })
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda principal y filtros rápidos */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por número de pedido, cliente o email..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="FULFILLED">Completado</SelectItem>
              <SelectItem value="UNFULFILLED">Pendiente</SelectItem>
              <SelectItem value="PARTIALLY_FULFILLED">Parcial</SelectItem>
              <SelectItem value="PAID">Pagado</SelectItem>
              <SelectItem value="PENDING">Pago Pendiente</SelectItem>
              <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="amount">Monto</SelectItem>
              <SelectItem value="customer">Cliente</SelectItem>
              <SelectItem value="number">Número</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
            title={filters.sortOrder === "asc" ? "Ascendente" : "Descendente"}
          >
            {filters.sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </Button>

          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros rápidos por período */}
      <div className="flex flex-wrap gap-2">
        <Label className="text-sm font-medium">Período rápido:</Label>
        {[
          { value: "all", label: "Todos" },
          { value: "today", label: "Hoy" },
          { value: "week", label: "7 días" },
          { value: "month", label: "Este mes" },
          { value: "quarter", label: "Trimestre" },
          { value: "year", label: "Este año" },
        ].map((period) => (
          <Button
            key={period.value}
            variant={filters.period === period.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rango de fechas */}
              <div className="space-y-2">
                <Label>Fecha desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rango de montos */}
              <div className="space-y-2">
                <Label>Monto mínimo (€)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter("minAmount", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Monto máximo (€)</Label>
                <Input
                  type="number"
                  placeholder="1000.00"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter("maxAmount", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de filtros activos y estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <>
              <Badge variant="secondary" className="gap-1">
                {totalOrders} pedidos encontrados
              </Badge>
              <Badge variant="secondary" className="gap-1">
                Total: {totalAmount.toFixed(2)} €
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1 h-6 px-2">
                <X className="h-3 w-3" />
                Limpiar filtros
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
