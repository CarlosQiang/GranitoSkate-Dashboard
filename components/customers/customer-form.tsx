"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getCustomerById } from "@/lib/actions"

interface CustomerFormProps {
  customerId: string
}

export function CustomerForm({ customerId }: CustomerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [customer, setCustomer] = useState<any | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true)
        const data = await getCustomerById(customerId)
        setCustomer(data)
      } catch (error) {
        console.error("Error al cargar el cliente:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del cliente",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, toast])

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">No se encontró el cliente</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/clientes")}>
          Volver a clientes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {customer.firstName} {customer.lastName}
          </h2>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <Button variant="outline" asChild>
          <a
            href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/customers/${customerId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver en Shopify
          </a>
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email || "No disponible"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{customer.phone || "No disponible"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fecha de registro</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.createdAt ? formatDate(customer.createdAt) : "No disponible"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dirección predeterminada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.defaultAddress ? (
                  <>
                    <p className="text-sm">
                      {customer.defaultAddress.address1}
                      {customer.defaultAddress.address2 && `, ${customer.defaultAddress.address2}`}
                    </p>
                    <p className="text-sm">
                      {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
                    </p>
                    <p className="text-sm">{customer.defaultAddress.country}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay dirección predeterminada</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.note ? (
                <p className="text-sm">{customer.note}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No hay notas para este cliente</p>
              )}
            </CardContent>
          </Card>

          {customer.tags && customer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">
                          <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={`/dashboard/pedidos/${order.id}`}>{order.name}</Link>
                          </Button>
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.processedAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
                        </p>
                        <p
                          className={`text-xs ${
                            order.financialStatus === "PAID" ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {order.financialStatus === "PAID" ? "Pagado" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Este cliente no tiene pedidos</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/dashboard/clientes")}>
          Volver a clientes
        </Button>
      </div>
    </div>
  )
}
