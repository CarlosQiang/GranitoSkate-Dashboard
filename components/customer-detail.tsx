"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { saveCustomerDNI } from "@/lib/api/customers"
import { formatCurrency } from "@/lib/utils"
import { Pencil, Save, User, MapPin, Tag, FileText, ShoppingBag } from "lucide-react"

interface CustomerDetailProps {
  customer: any
  onUpdate?: () => void
}

export function CustomerDetail({ customer, onUpdate }: CustomerDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditingDNI, setIsEditingDNI] = useState(false)
  const [dni, setDni] = useState(() => {
    const dniMetafield = customer.metafields?.find((m: any) => m.namespace === "customer" && m.key === "dni")
    return dniMetafield?.value || ""
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveDNI = async () => {
    try {
      setIsSaving(true)
      await saveCustomerDNI(customer.id, dni)
      setIsEditingDNI(false)
      toast({
        title: "DNI guardado",
        description: "El DNI se ha guardado correctamente",
      })
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo guardar el DNI: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="info">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="addresses">Direcciones</TabsTrigger>
        <TabsTrigger value="orders">Pedidos</TabsTrigger>
        <TabsTrigger value="metafields">Metadatos</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del cliente
            </CardTitle>
            <CardDescription>Datos personales y de contacto del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <div className="font-medium">
                  {customer.firstName} {customer.lastName}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="font-medium flex items-center gap-2">
                  {customer.email}
                  {customer.verifiedEmail && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Verificado</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <div className="font-medium">{customer.phone || "No disponible"}</div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>DNI</span>
                  {!isEditingDNI ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDNI(true)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDNI(false)}>
                      Cancelar
                    </Button>
                  )}
                </Label>

                {!isEditingDNI ? (
                  <div className="font-medium">{dni || "No registrado"}</div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Introduce el DNI" />
                    <Button onClick={handleSaveDNI} disabled={isSaving} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Pedidos Realizados
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-blue-600">{customer.ordersCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customer.ordersCount === 1 ? "pedido" : "pedidos"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    Total Invertido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">importe total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiquetas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin etiquetas</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            {customer.ordersCount > 0 && (
              <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${customer.id}/orders`)}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver pedidos
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="addresses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Direcciones
            </CardTitle>
            <CardDescription>Direcciones registradas del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address: any, index: number) => (
                  <Card key={address.id || index}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">
                        {address.id === customer.defaultAddress?.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full mr-2">
                            Predeterminada
                          </span>
                        )}
                        Dirección {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-1">
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.province} {address.zip}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>Tel: {address.phone}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Este cliente no tiene direcciones registradas
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Pedidos del Cliente
            </CardTitle>
            <CardDescription>Resumen y historial de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.ordersCount > 0 ? (
              <div className="space-y-4">
                {/* Resumen de pedidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Total de Pedidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{customer.ordersCount}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {customer.ordersCount === 1 ? "pedido realizado" : "pedidos realizados"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Total Gastado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Importe total de todos los pedidos</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Botón para ver todos los pedidos */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => router.push(`/dashboard/customers/${customer.id}/orders`)}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Ver Historial Completo de Pedidos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Este cliente no ha realizado ningún pedido</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Los pedidos aparecerán aquí una vez que el cliente realice una compra
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metafields" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Metadatos
            </CardTitle>
            <CardDescription>Información adicional del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.metafields && customer.metafields.length > 0 ? (
              <div className="border rounded-md divide-y">
                {customer.metafields.map((metafield: any, index: number) => (
                  <div key={metafield.id || index} className="p-3 flex">
                    <div className="flex-1">
                      <div className="font-medium">
                        {metafield.namespace}.{metafield.key}
                      </div>
                      <div className="text-sm text-muted-foreground">{metafield.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Este cliente no tiene metadatos adicionales</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
