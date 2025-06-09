"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { fetchCustomerOrders } from "@/lib/api/orders"
import { ArrowLeft, ShoppingBag, Calendar, CreditCard, Package } from "lucide-react"

interface Order {
  id: string
  name: string
  processedAt: string
  displayFulfillmentStatus: string
  displayFinancialStatus: string
  totalPrice: string
  currencyCode: string
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string>("")
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        // Limpiar el ID del cliente
        let customerId = params.id as string
        if (customerId.includes("gid://")) {
          customerId = customerId.split("/").pop() || customerId
        }

        console.log(`🔍 Cargando pedidos para cliente: ${customerId}`)

        const data = await fetchCustomerOrders(customerId)
        setOrders(data)

        console.log(`✅ Pedidos cargados: ${data.length}`)

        if (data.length === 0) {
          toast({
            title: "Sin pedidos",
            description: "Este cliente no tiene pedidos registrados",
          })
        }
      } catch (error) {
        console.error("Error loading customer orders:", error)
        const errorMessage = `Error al cargar los pedidos: ${(error as Error).message}`
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadOrders()
    }
  }, [params.id, toast])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "fulfilled":
        return "bg-green-100 text-green-800"
      case "pending":
      case "unfulfilled":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando pedidos del cliente...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Cliente
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pedidos del Cliente</h1>
          <p className="text-muted-foreground">ID: {params.id}</p>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Error al cargar los pedidos</p>
              <p className="text-sm mt-2">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Resumen de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {orders.length === 1 ? "Pedido Total" : "Pedidos Totales"}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice), 0).toString(),
                      orders[0]?.currencyCode || "EUR",
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      (
                        orders.reduce((sum, order) => sum + Number.parseFloat(order.totalPrice), 0) / orders.length
                      ).toString(),
                      orders[0]?.currencyCode || "EUR",
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Valor Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pedidos */}
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.name}</h3>
                        <Badge className={getStatusColor(order.displayFinancialStatus)}>
                          {order.displayFinancialStatus}
                        </Badge>
                        <Badge className={getStatusColor(order.displayFulfillmentStatus)}>
                          {order.displayFulfillmentStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.processedAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          ID: {order.id}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="font-medium text-lg text-primary">
                            {formatCurrency(order.totalPrice, order.currencyCode)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin Pedidos Registrados</h3>
              <p className="text-muted-foreground mb-6">Este cliente aún no ha realizado ningún pedido en la tienda.</p>
              <Button variant="outline" onClick={() => router.back()}>
                Volver al Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
