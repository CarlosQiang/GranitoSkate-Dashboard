"use client"

import { useState, useEffect } from "react"
import { fetchOrders } from "@/lib/api/orders"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShopifyApiStatus } from "@/components/shopify-api-status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar cargar pedidos con hasta 3 reintentos
      let attempts = 0
      let success = false
      let data = null

      while (attempts < 3 && !success) {
        try {
          data = await fetchOrders({
            limit: 50,
            sortKey: "PROCESSED_AT",
            reverse: sortOrder === "newest",
          })
          success = true
        } catch (err) {
          console.warn(`Intento ${attempts + 1} fallido:`, err)
          attempts++
          if (attempts < 3) {
            // Esperar antes de reintentar
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            throw err
          }
        }
      }

      setOrders(data.orders || [])
      setFilteredOrders(data.orders || [])
    } catch (err) {
      console.error("Error al cargar pedidos:", err)
      setError(err.message || "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [sortOrder])

  useEffect(() => {
    // Filtrar pedidos por término de búsqueda y estado
    const filtered = orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.firstName && order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.lastName && order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && order.financialStatus === "PAID") ||
        (statusFilter === "unpaid" && order.financialStatus !== "PAID") ||
        (statusFilter === "fulfilled" && order.fulfillmentStatus === "FULFILLED") ||
        (statusFilter === "unfulfilled" && order.fulfillmentStatus !== "FULFILLED")

      return matchesSearch && matchesStatus
    })

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  const getStatusBadge = (order) => {
    // Financiero
    if (order.financialStatus === "PAID") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pagado</Badge>
    } else if (order.financialStatus === "PARTIALLY_PAID") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pago parcial</Badge>
    } else if (order.financialStatus === "REFUNDED") {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Reembolsado</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Pendiente</Badge>
    }
  }

  const getFulfillmentBadge = (order) => {
    if (order.fulfillmentStatus === "FULFILLED") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Enviado</Badge>
    } else if (order.fulfillmentStatus === "PARTIALLY_FULFILLED") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Envío parcial</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Pendiente</Badge>
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar pedidos</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadOrders} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <ShopifyApiStatus />
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ShopifyApiStatus />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pedidos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="paid">Pagados</SelectItem>
            <SelectItem value="unpaid">Pendientes de pago</SelectItem>
            <SelectItem value="fulfilled">Enviados</SelectItem>
            <SelectItem value="unfulfilled">Pendientes de envío</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes primero</SelectItem>
            <SelectItem value="oldest">Más antiguos primero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron pedidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link href={`/dashboard/orders/${order.id.split("/").pop()}`} key={order.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">{order.name}</CardTitle>
                  <div className="flex gap-2">
                    {getStatusBadge(order)}
                    {getFulfillmentBadge(order)}
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{formatDate(order.processedAt)}</p>
                      <p className="text-sm">
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : order.email || "Cliente sin información"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {order.totalPrice} {order.currencyCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.lineItems.length} {order.lineItems.length === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
