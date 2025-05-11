"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchCustomerById } from "@/lib/api/customers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Calendar, DollarSign, Edit } from "lucide-react"
import Link from "next/link"
import CustomerAddressCard from "@/components/customer-address-card"
import CustomerAddressForm from "@/components/customer-address-form"

export default function CustomerDetailsPage({ params }) {
  const { id } = params
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddAddressForm, setShowAddAddressForm] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        const data = await fetchCustomerById(id)

        if (data.error) {
          setError(data.errorMessage || "Error al cargar cliente")
          setCustomer(null)
        } else {
          setCustomer(data)
          setError(null)
        }
      } catch (err) {
        setError(err.message || "Error al cargar cliente")
        setCustomer(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadCustomer()
    }
  }, [id])

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

  const handleEditCustomer = () => {
    router.push(`/dashboard/customers/${id}/edit`)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await fetchCustomerById(id)
      if (data.error) {
        setError(data.errorMessage || "Error al cargar cliente")
        setCustomer(null)
      } else {
        setCustomer(data)
        setError(null)
      }
    } catch (err) {
      setError(err.message || "Error al cargar cliente")
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Cliente</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-6">
          <Button onClick={handleRefresh}>Intentar de nuevo</Button>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalles del Cliente</h1>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cliente no encontrado</AlertTitle>
          <AlertDescription>
            No se pudo encontrar el cliente solicitado. Por favor, verifica el ID o regresa a la lista de clientes.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/dashboard/customers")}>Volver a Clientes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.displayName ||
              `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
              "Cliente sin nombre"}
          </h1>
          {customer.verifiedEmail && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verificado
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditCustomer}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Fecha de registro</p>
                <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Pedidos realizados</p>
                <p className="text-sm text-muted-foreground">{customer.ordersCount || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Total gastado</p>
                <p className="text-sm text-muted-foreground">{formatPrice(customer.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="addresses">
              <TabsList className="mb-4">
                <TabsTrigger value="addresses">Direcciones</TabsTrigger>
                <TabsTrigger value="orders">Pedidos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="addresses" className="space-y-4">
                {!showAddAddressForm ? (
                  <Button onClick={() => setShowAddAddressForm(true)}>Añadir Dirección</Button>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Nueva Dirección</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomerAddressForm
                        customerId={customer.id}
                        onSuccess={() => {
                          setShowAddAddressForm(false)
                          handleRefresh()
                        }}
                        onCancel={() => setShowAddAddressForm(false)}
                      />
                    </CardContent>
                  </Card>
                )}

                {customer.addresses && customer.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.addresses.map((address) => (
                      <CustomerAddressCard
                        key={address.id}
                        address={address}
                        customerId={customer.id}
                        isDefault={customer.defaultAddress && customer.defaultAddress.id === address.id}
                        onUpdate={handleRefresh}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Este cliente no tiene direcciones guardadas.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders">
                {customer.orders && customer.orders.length > 0 ? (
                  <div className="space-y-4">
                    {customer.orders.map((order) => (
                      <Card key={order.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{order.name}</CardTitle>
                            <Badge variant={order.financialStatus === "PAID" ? "success" : "secondary"}>
                              {order.financialStatus === "PAID" ? "Pagado" : order.financialStatus}
                            </Badge>
                          </div>
                          <CardDescription>{formatDate(order.processedAt)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Total</p>
                              <p className="text-2xl font-bold">{formatPrice(order.totalPrice)}</p>
                            </div>
                            <Badge
                              variant={
                                order.fulfillmentStatus === "FULFILLED"
                                  ? "success"
                                  : order.fulfillmentStatus === "IN_PROGRESS"
                                    ? "warning"
                                    : "outline"
                              }
                            >
                              {order.fulfillmentStatus === "FULFILLED"
                                ? "Enviado"
                                : order.fulfillmentStatus === "IN_PROGRESS"
                                  ? "En proceso"
                                  : "Pendiente"}
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>Ver detalles del pedido</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Este cliente no ha realizado ningún pedido.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No hay notas disponibles para este cliente.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
