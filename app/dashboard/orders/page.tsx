"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Eye, AlertCircle, RefreshCw, Filter } from "lucide-react"
import { fetchRecentOrders } from "@/lib/api/orders"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersFilters, type OrderFilters } from "@/components/orders-filters"
import { cn } from "@/lib/utils"

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
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
    const getOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRecentOrders(50)
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
      const data = await fetchRecentOrders(50)
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

  const applyFilters = (orders: any[], filters: OrderFilters) => {
    let filtered = [...orders]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchLower) ||
          `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.toLowerCase().includes(searchLower) ||
          order.customer?.email?.toLowerCase().includes(searchLower),
      )
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((order) =>
        filters.status.includes(order.displayFulfillmentStatus?.toLowerCase() || "pending"),
      )
    }

    if (filters.paymentStatus.length > 0) {
      filtered = filtered.filter((order) =>
        filters.paymentStatus.includes(order.displayFinancialStatus?.toLowerCase() || "pending"),
      )
    }

    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.processedAt)
        const fromDate = filters.dateRange.from
        const toDate = filters.dateRange.to

        if (fromDate && orderDate < fromDate) return false
        if (toDate && orderDate > toDate) return false
        return true
      })
    }

    if (filters.amountRange.min || filters.amountRange.max) {
      filtered = filtered.filter((order) => {
        const amount = Number.parseFloat(order.totalPrice || "0")
        const min = Number.parseFloat(filters.amountRange.min || "0")
        const max = Number.parseFloat(filters.amountRange.max || "999999")

        return amount >= min && amount <= max
      })
    }

    if (filters.customerType !== "all") {
      filtered = filtered.filter((order) => {
        switch (filters.customerType) {
          case "registered":
            return order.customer !== null
          case "guest":
            return order.customer === null
          case "returning":
            return order.customer !== null
          case "new":
            return order.customer !== null
          default:
            return true
        }
      })
    }

    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case "date":
          aValue = new Date(a.processedAt).getTime()
          bValue = new Date(b.processedAt).getTime()
          break
        case "amount":
          aValue = Number.parseFloat(a.totalPrice || "0")
          bValue = Number.parseFloat(b.totalPrice || "0")
          break
        case "customer":
          aValue = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.toLowerCase()
          bValue = `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase()
          break
        case "status":
          aValue = a.displayFulfillmentStatus || ""
          bValue = b.displayFulfillmentStatus || ""
          break
        case "order_number":
          aValue = a.name || ""
          bValue = b.name || ""
          break
        default:
          aValue = new Date(a.processedAt).getTime()
          bValue = new Date(b.processedAt).getTime()
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }

  const filteredOrders = applyFilters(orders, filters)

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex-responsive-between">
          <div>
            <h1 className="heading-responsive">Pedidos</h1>
            <p className="caption-responsive">Gestiona los pedidos de tu tienda</p>
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex-responsive-between">
        <div>
          <h1 className="heading-responsive">Pedidos</h1>
          <p className="caption-responsive">Gestiona los pedidos de tu tienda</p>
        </div>
        {isMobile && (
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="mobile-full-width sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div
        className={cn(
          isMobile && !showMobileFilters && "hidden",
          isMobile && showMobileFilters && "mobile-bottom-sheet",
        )}
      >
        <OrdersFilters onFiltersChange={setFilters} totalOrders={orders.length} filteredCount={filteredOrders.length} />
      </div>

      {/* Tabla responsive */}
      <Card className="overflow-hidden">
        <div className="table-responsive">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead className="tablet-up">Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="tablet-up">Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="tablet-up">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="tablet-up">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead className="tablet-up">Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="tablet-up">Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-sm">{order.name}</div>
                        {isMobile && (
                          <div className="text-xs text-muted-foreground">{formatDate(order.processedAt)}</div>
                        )}
                      </TableCell>
                      <TableCell className="tablet-up">{formatDate(order.processedAt)}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : "Cliente no registrado"}
                        </div>
                        {isMobile && (
                          <Badge className={cn("text-xs mt-1", getStatusColor(order.displayFulfillmentStatus))}>
                            {order.displayFulfillmentStatus || "PENDIENTE"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="tablet-up">
                        <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
                          {order.displayFulfillmentStatus || "PENDIENTE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(order.totalPrice, order.currencyCode)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          )}
        </div>
      </Card>
    </div>
  )
}
