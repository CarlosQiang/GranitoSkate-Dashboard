"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchCustomers } from "@/lib/api/customers"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Search, Filter, Mail, DollarSign, Calendar, MoreHorizontal, UserCheck, UserX } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [minSpent, setMinSpent] = useState(0)
  const [maxSpent, setMaxSpent] = useState(1000)
  const [hasEmail, setHasEmail] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")

  const router = useRouter()

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const data = await fetchCustomers(100)
        setCustomers(data)
        setError(null)
      } catch (err) {
        setError(err.message || "Error al cargar clientes")
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  // Función para formatear el precio
  const formatPrice = (price) => {
    if (!price) return "0,00 €"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return numPrice.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Filtrar y ordenar clientes
  const filteredCustomers = useMemo(() => {
    if (!customers || customers.length === 0) return []

    let result = [...customers]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (customer) =>
          (customer.firstName && customer.firstName.toLowerCase().includes(term)) ||
          (customer.lastName && customer.lastName.toLowerCase().includes(term)) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.phone && customer.phone.includes(term)),
      )
    }

    // Filtrar por gasto mínimo
    if (minSpent > 0) {
      result = result.filter((customer) => {
        const spent =
          typeof customer.totalSpent === "string"
            ? Number.parseFloat(customer.totalSpent)
            : customer.totalSpent?.amount
              ? Number.parseFloat(customer.totalSpent.amount)
              : 0
        return spent >= minSpent
      })
    }

    // Filtrar por gasto máximo
    if (maxSpent < 1000) {
      result = result.filter((customer) => {
        const spent =
          typeof customer.totalSpent === "string"
            ? Number.parseFloat(customer.totalSpent)
            : customer.totalSpent?.amount
              ? Number.parseFloat(customer.totalSpent.amount)
              : 0
        return spent <= maxSpent
      })
    }

    // Filtrar por si tiene email
    if (hasEmail) {
      result = result.filter((customer) => customer.email && customer.email.trim() !== "")
    }

    // Ordenar resultados
    result.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "name":
          valueA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase()
          valueB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase()
          break
        case "email":
          valueA = (a.email || "").toLowerCase()
          valueB = (b.email || "").toLowerCase()
          break
        case "orders":
          valueA = a.ordersCount || 0
          valueB = b.ordersCount || 0
          break
        case "spent":
          valueA =
            typeof a.totalSpent === "string"
              ? Number.parseFloat(a.totalSpent)
              : a.totalSpent?.amount
                ? Number.parseFloat(a.totalSpent.amount)
                : 0
          valueB =
            typeof b.totalSpent === "string"
              ? Number.parseFloat(b.totalSpent)
              : b.totalSpent?.amount
                ? Number.parseFloat(b.totalSpent.amount)
                : 0
          break
        case "date":
          valueA = new Date(a.createdAt || 0).getTime()
          valueB = new Date(b.createdAt || 0).getTime()
          break
        default:
          valueA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase()
          valueB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase()
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    return result
  }, [customers, searchTerm, minSpent, maxSpent, hasEmail, sortBy, sortOrder])

  // Encontrar el valor máximo de gasto para el slider
  const maxPossibleSpent = useMemo(() => {
    if (!customers || customers.length === 0) return 1000

    let max = 0
    customers.forEach((customer) => {
      const spent =
        typeof customer.totalSpent === "string"
          ? Number.parseFloat(customer.totalSpent)
          : customer.totalSpent?.amount
            ? Number.parseFloat(customer.totalSpent.amount)
            : 0
      if (spent > max) max = spent
    })

    return Math.max(1000, Math.ceil(max / 100) * 100)
  }, [customers])

  const handleViewDetails = (id) => {
    router.push(`/dashboard/customers/${id}`)
  }

  const handleViewOrders = (id) => {
    router.push(`/dashboard/customers/${id}/orders`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>
        <Button onClick={() => router.push("/dashboard/customers/new")}>Nuevo Cliente</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}. Por favor, verifica tu conexión con Shopify.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="orders">Pedidos</SelectItem>
                  <SelectItem value="spent">Gasto</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                title={sortOrder === "asc" ? "Orden ascendente" : "Orden descendente"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border rounded-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="price-range">Rango de gasto</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(minSpent)} - {formatPrice(maxSpent)}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      id="price-range"
                      min={0}
                      max={maxPossibleSpent}
                      step={10}
                      value={[minSpent, maxSpent]}
                      onValueChange={([min, max]) => {
                        setMinSpent(min)
                        setMaxSpent(max)
                      }}
                      className="my-6"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="has-email" checked={hasEmail} onCheckedChange={setHasEmail} />
                  <Label htmlFor="has-email">Solo clientes con email</Label>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron clientes con los criterios seleccionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Total gastado</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.displayName ||
                            `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                            "Cliente sin nombre"}
                          {customer.verifiedEmail && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {customer.email}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <UserX className="h-3 w-3 mr-1" />
                            Sin email
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{customer.ordersCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatPrice(customer.totalSpent)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(customer.id)}>
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewOrders(customer.id)}>
                              Ver pedidos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
