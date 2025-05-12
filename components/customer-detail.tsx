"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { saveCustomerDNI } from "@/lib/api/customers"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Pencil, Save, User, MapPin, Tag, FileText, ShoppingBag } from "lucide-react"

interface CustomerDetailProps {
  customer: any
  onUpdate?: () => void
}

export function CustomerDetail({ customer, onUpdate }: CustomerDetailProps) {
  const { toast } = useToast()
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
    <Tabs defaultValue="info" className="w-full">
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
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{customer.ordersCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total gastado
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">
                    {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                  </div>
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
          <CardFooter className="text-sm text-muted-foreground">
            Cliente desde {formatDate(customer.createdAt)}
            {customer.updatedAt && customer.updatedAt !== customer.createdAt && (
              <> · Última actualización: {formatDate(customer.updatedAt)}</>
            )}
          </CardFooter>
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
              Pedidos
            </CardTitle>
            <CardDescription>Historial de pedidos del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aquí iría la lista de pedidos, pero no está en el alcance actual */}
            <div className="text-center py-8 text-muted-foreground">
              La información de pedidos se cargará desde la sección de pedidos
            </div>
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
