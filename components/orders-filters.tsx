"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface OrderFilters {
  search: string
  status: string[]
  paymentStatus: string[]
  fulfillmentStatus: string[]
  dateRange: { from: Date | null; to: Date | null }
  amountRange: { min: string; max: string }
  customerType: string
  paymentMethod: string[]
  shippingMethod: string[]
  tags: string[]
  sortBy: string
  sortOrder: string
}

interface OrdersFiltersProps {
  onFiltersChange: (filters: OrderFilters) => void
  totalOrders: number
  filteredCount: number
}

export function OrdersFilters({ onFiltersChange, totalOrders, filteredCount }: OrdersFiltersProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: [],
    paymentStatus: [],
    fulfillmentStatus: [],
    dateRange: { from: null, to: null },
    amountRange: { min: "", max: "" },
    customerType: "all",
    paymentMethod: [],
    shippingMethod: [],
    tags: [],
    sortBy: "date",
    sortOrder: "desc",
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof OrderFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: keyof OrderFilters, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      paymentStatus: [],
      fulfillmentStatus: [],
      dateRange: { from: null, to: null },
      amountRange: { min: "", max: "" },
      customerType: "all",
      paymentMethod: [],
      shippingMethod: [],
      tags: [],
      sortBy: "date",
      sortOrder: "desc",
    })
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status.length > 0 ||
      filters.paymentStatus.length > 0 ||
      filters.fulfillmentStatus.length > 0 ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.amountRange.min ||
      filters.amountRange.max ||
      filters.customerType !== "all" ||
      filters.paymentMethod.length > 0 ||
      filters.shippingMethod.length > 0 ||
      filters.tags.length > 0
    )
  }

  const statusOptions = [
    { value: "fulfilled", label: "Completado" },
    { value: "unfulfilled", label: "Pendiente" },
    { value: "partially_fulfilled", label: "Parcialmente completado" },
    { value: "cancelled", label: "Cancelado" },
  ]

  const paymentStatusOptions = [
    { value: "paid", label: "Pagado" },
    { value: "pending", label: "Pendiente" },
    { value: "refunded", label: "Reembolsado" },
    { value: "partially_refunded", label: "Parcialmente reembolsado" },
  ]

  const customerTypeOptions = [
    { value: "all", label: "Todos" },
    { value: "registered", label: "Registrados" },
    { value: "guest", label: "Invitados" },
    { value: "returning", label: "Recurrentes" },
    { value: "new", label: "Nuevos" },
  ]

  if (isMobile) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredCount} de {totalOrders}
              </Badge>
              {hasActiveFilters() && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Número de pedido, cliente..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ordenar por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="amount">Importe</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                  <SelectItem value="order_number">Número</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Orden</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descendente</SelectItem>
                  <SelectItem value="asc">Ascendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros avanzados colapsables */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-9">
                <span>Filtros avanzados</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4">
              {/* Estado del pedido */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Estado del pedido</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status.includes(option.value)}
                        onCheckedChange={() => toggleArrayFilter("status", option.value)}
                      />
                      <Label htmlFor={`status-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estado de pago */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Estado de pago</Label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentStatusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${option.value}`}
                        checked={filters.paymentStatus.includes(option.value)}
                        onCheckedChange={() => toggleArrayFilter("paymentStatus", option.value)}
                      />
                      <Label htmlFor={`payment-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipo de cliente */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de cliente</Label>
                <Select value={filters.customerType} onValueChange={(value) => updateFilter("customerType", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de fechas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rango de fechas</Label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => updateFilter("dateRange", range)}
                />
              </div>

              {/* Rango de importe */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rango de importe (€)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.amountRange.min}
                    onChange={(e) => updateFilter("amountRange", { ...filters.amountRange, min: e.target.value })}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.amountRange.max}
                    onChange={(e) => updateFilter("amountRange", { ...filters.amountRange, max: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    )
  }

  // Desktop version
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de pedidos
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Mostrando {filteredCount} de {totalOrders} pedidos
            </Badge>
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primera fila: Búsqueda y ordenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="search-desktop" className="text-sm font-medium">
              Buscar pedidos
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-desktop"
                placeholder="Número de pedido, cliente, email..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Ordenar por</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="amount">Importe</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
                <SelectItem value="order_number">Número</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Orden</Label>
            <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descendente</SelectItem>
                <SelectItem value="asc">Ascendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Segunda fila: Filtros de estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estado del pedido</Label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-desktop-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => toggleArrayFilter("status", option.value)}
                  />
                  <Label htmlFor={`status-desktop-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Estado de pago</Label>
            <div className="space-y-2">
              {paymentStatusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-desktop-${option.value}`}
                    checked={filters.paymentStatus.includes(option.value)}
                    onCheckedChange={() => toggleArrayFilter("paymentStatus", option.value)}
                  />
                  <Label htmlFor={`payment-desktop-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de cliente</Label>
            <Select value={filters.customerType} onValueChange={(value) => updateFilter("customerType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customerTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Tercera fila: Filtros de rango */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rango de fechas</Label>
            <DatePickerWithRange date={filters.dateRange} onDateChange={(range) => updateFilter("dateRange", range)} />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Rango de importe (€)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Mínimo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.amountRange.min}
                  onChange={(e) => updateFilter("amountRange", { ...filters.amountRange, min: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Máximo</Label>
                <Input
                  type="number"
                  placeholder="Sin límite"
                  value={filters.amountRange.max}
                  onChange={(e) => updateFilter("amountRange", { ...filters.amountRange, max: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
