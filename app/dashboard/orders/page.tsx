"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Eye, AlertCircle, RefreshCw } from "lucide-react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SyncOrdersOnly } from "@/components/sync-orders-only"
import { OrdersFilters } from "@/components/orders-filters"
import { ResponsivePageContainer } from "@/components/responsive-page-container"

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

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "",
    sortBy: "date",
    sortOrder: "desc",
    dateFrom: undefined,
    dateTo: undefined,
    minAmount: "",
    maxAmount: "",
    period: "all",
  })

  useEffect(() => {
    const getOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRecentOrders(100) // Obtener más pedidos para filtrar
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(`Error al cargar pedidos: ${(error as Error).message}`)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getOrders()
  }, [toast])

  // Filtrar y ordenar pedidos
  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchLower) ||
          `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.toLowerCase().includes(searchLower) ||
          order.customer?.email?.toLowerCase().includes(searchLower),
      )
    }

    // Filtro de estado
    if (filters.status) {
      filtered = filtered.filter((order) => order.displayFulfillmentStatus === filters.status)
    }

    // Filtro de fechas
    if (filters.dateFrom) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.processedAt)
        return orderDate >= filters.dateFrom!
      })
    }

    if (filters.dateTo) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.processedAt)
        return orderDate <= filters.dateTo!
      })
    }

    // Filtro de montos
    if (filters.minAmount) {
      const minAmount = Number.parseFloat(filters.minAmount)
      filtered = filtered.filter((order) => Number.parseFloat(order.totalPrice) >= minAmount)
    }

    if (filters.maxAmount) {
      const maxAmount = Number.parseFloat(filters.maxAmount)
      filtered = filtered.filter((order) => Number.parseFloat(order.totalPrice) <= maxAmount)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case "amount":
          aValue = Number.parseFloat(a.totalPrice)
          bValue = Number.parseFloat(b.totalPrice)
          break
        case "customer":
          aValue = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.toLowerCase()
          bValue = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase()
          break
        case "number":
          aValue = a.name
          bValue = b.name
          break
        case "date":
        default:
          aValue = new Date(a.processedAt).getTime()
          bValue = new Date(b.processedAt).getTime()
          break
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [orders, filters])

  // Estadísticas de los pedidos filtrados
  const stats = useMemo(() => {
    const totalAmount = filteredOrders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice), 0)
    return {
      totalOrders: filteredOrders.length,
      totalAmount,
    }
  }, [filteredOrders])

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"

    switch (status.toUpperCase()) {
      case "FULFILLED":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "PARTIALLY_FULFILLED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "REFUNDED":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  const handleRetry = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchRecentOrders(100)
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(`Error al cargar pedidos: ${(error as Error).message}`)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      sortBy: "date",
      sortOrder: "desc",
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: "",
      maxAmount: "",
      period: "all",
    })
  }

  if (error) {
    return (
      <ResponsivePageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
              <p className="text-muted-foreground">Gestiona los pedidos de tu tienda</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Error al cargar pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsivePageContainer>
    )
  }

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">Gestiona los pedidos de tu tienda</p>
          </div>
        </div>

        <OrdersFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          totalOrders={stats.totalOrders}
          totalAmount={stats.totalAmount}
        />

        <div className="w-full overflow-hidden rounded-md border">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No se encontraron pedidos con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.name}</div>
                      </TableCell>
                      <TableCell>{formatDate(order.processedAt)}</TableCell>
                      <TableCell>
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : "Cliente no registrado"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
                          {order.displayFulfillmentStatus || "PENDIENTE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalPrice, order.currencyCode)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Componente de reemplazo de pedidos al final */}
        <div className="w-full">
          <SyncOrdersOnly onSyncComplete={() => {}} />
        </div>
      </div>
    </ResponsivePageContainer>
  )
}
