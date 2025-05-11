"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LoadingState } from "@/components/loading-state"
import { fetchOrders } from "@/lib/api/orders"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Search } from "lucide-react"

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const ordersPerPage = 10

  useEffect(() => {
    const getOrdersList = async () => {
      if (!session?.user) return

      setLoading(true)
      try {
        // Construir filtros para la API de Shopify
        const filters = {
          sortKey: "PROCESSED_AT",
          reverse: sortOrder === "desc",
          first: 50, // Obtenemos más para filtrar en el cliente
        }

        // Añadir filtro de estado si es necesario
        if (statusFilter !== "all") {
          if (
            statusFilter === "fulfilled" ||
            statusFilter === "unfulfilled" ||
            statusFilter === "partially_fulfilled"
          ) {
            filters.fulfillmentStatus = statusFilter.toUpperCase()
          } else if (statusFilter === "paid" || statusFilter === "unpaid" || statusFilter === "refunded") {
            filters.financialStatus = statusFilter.toUpperCase()
          }
        }

        // Añadir búsqueda si hay término
        if (searchTerm) {
          filters.query = searchTerm
        }

        const response = await fetchOrders(filters)

        if (response && response.orders) {
          // Paginación en el cliente
          const totalItems = response.orders.length
          setTotalPages(Math.ceil(totalItems / ordersPerPage))

          const startIndex = (currentPage - 1) * ordersPerPage
          const paginatedOrders = response.orders.slice(startIndex, startIndex + ordersPerPage)

          setOrders(paginatedOrders)
          setError(null)
        } else {
          setOrders([])
          setError("No se pudieron cargar los pedidos")
        }
      } catch (err) {
        console.error("Error al cargar pedidos:", err)
        setError("Error al cargar los pedidos: " + (err.message || "Intente nuevamente"))
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    getOrdersList()
  }, [session, currentPage, searchTerm, statusFilter, sortOrder])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleOrderClick = (orderId) => {
    router.push(`/dashboard/orders/${orderId}`)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      FULFILLED: { label: "Completado", variant: "success" },
      UNFULFILLED: { label: "Pendiente", variant: "warning" },
      PARTIALLY_FULFILLED: { label: "Parcial", variant: "info" },
      CANCELLED: { label: "Cancelado", variant: "destructive" },
      REFUNDED: { label: "Reembolsado", variant: "secondary" },
      PAID: { label: "Pagado", variant: "success" },
      UNPAID: { label: "Sin pagar", variant: "destructive" },
      PENDING: { label: "Pendiente", variant: "warning" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <LoadingState message="Cargando pedidos..." />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tu tienda Shopify</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los pedidos</CardTitle>
          <CardDescription>
            {orders.length > 0 ? `Mostrando ${orders.length} pedidos` : "No se encontraron pedidos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="fulfilled">Completados</SelectItem>
                  <SelectItem value="unfulfilled">Pendientes</SelectItem>
                  <SelectItem value="partially_fulfilled">Parciales</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="unpaid">Sin pagar</SelectItem>
                  <SelectItem value="refunded">Reembolsados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Más recientes primero</SelectItem>
                  <SelectItem value="asc">Más antiguos primero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{error}</div>}

          {orders.length > 0 ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <TableCell className="font-medium">#{order.name}</TableCell>
                        <TableCell>{formatDate(order.processedAt)}</TableCell>
                        <TableCell>
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : "Cliente anónimo"}
                        </TableCell>
                        <TableCell>{formatCurrency(order.totalPrice, order.currencyCode)}</TableCell>
                        <TableCell>{getStatusBadge(order.fulfillmentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOrderClick(order.id)
                            }}
                          >
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={currentPage === pageNum} onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : !loading && !error ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron pedidos</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setSortOrder("desc")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
