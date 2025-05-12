"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { updateCustomerDNI } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, X, Package } from "lucide-react"

export default function CustomerDetail({ customer }) {
  const router = useRouter()
  const { toast } = useToast()
  const [dni, setDni] = useState(customer.dni || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveDNI = async () => {
    try {
      setIsSaving(true)
      await updateCustomerDNI(customer.id, dni)
      toast({
        title: "DNI actualizado",
        description: "El DNI del cliente ha sido actualizado correctamente",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating DNI:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el DNI del cliente",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="información">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="información">Información</TabsTrigger>
        <TabsTrigger value="direcciones">Direcciones</TabsTrigger>
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="metadatos">Metadatos</TabsTrigger>
      </TabsList>

      <TabsContent value="información" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">Información del cliente</span>
            </CardTitle>
            <CardDescription>Datos personales y de contacto del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Nombre completo</h3>
                <p className="text-lg">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Email</h3>
                <div className="flex items-center">
                  <p className="text-lg">{customer.email}</p>
                  {customer.emailVerified && <Badge className="ml-2 bg-green-100 text-green-800">Verificado</Badge>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Teléfono</h3>
                <p className="text-lg">{customer.phone || "No registrado"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">DNI</h3>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Introduce el DNI"
                      className="max-w-xs"
                    />
                    <Button variant="outline" size="icon" onClick={handleSaveDNI} disabled={isSaving}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDni(customer.dni || "")
                        setIsEditing(false)
                      }}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg">{customer.dni || "No registrado"}</p>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Pedidos</h3>
                <p className="text-3xl font-bold">{customer.ordersCount || 0}</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Total gastado</h3>
                <p className="text-3xl font-bold">{formatCurrency(customer.totalSpent || 0)}</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Cliente desde</h3>
                <p className="text-lg font-medium">{formatDate(customer.createdAt)}</p>
              </div>
            </div>

            {customer.ordersCount > 0 && (
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${customer.id}/orders`)}>
                  <Package className="mr-2 h-4 w-4" />
                  Ver pedidos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="direcciones" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Direcciones</CardTitle>
            <CardDescription>Direcciones registradas del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {address.isDefaultAddress && <Badge className="mb-2">Predeterminada</Badge>}
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>
                      {address.city}, {address.province} {address.zip}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && <p>Tel: {address.phone}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">Este cliente no tiene direcciones registradas</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pedidos" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Historial de pedidos del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.ordersCount > 0 ? (
              <div className="text-center py-6">
                <p className="mb-4">
                  Este cliente tiene {customer.ordersCount} pedidos por un total de{" "}
                  {formatCurrency(customer.totalSpent || 0)}
                </p>
                <Button onClick={() => router.push(`/dashboard/customers/${customer.id}/orders`)}>
                  <Package className="mr-2 h-4 w-4" />
                  Ver todos los pedidos
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">Este cliente no ha realizado ningún pedido</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metadatos" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Metadatos</CardTitle>
            <CardDescription>Información adicional del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.metafields && customer.metafields.length > 0 ? (
              <div className="space-y-4">
                {customer.metafields.map((metafield, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium">{metafield.key}</p>
                    <p className="text-sm text-muted-foreground">{metafield.namespace}</p>
                    <p className="mt-2">{metafield.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">Este cliente no tiene metadatos adicionales</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
