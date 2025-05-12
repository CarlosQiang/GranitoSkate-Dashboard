"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  fetchCustomerById,
  updateCustomer,
  saveCustomerDNI,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "@/lib/api/customers"
import { ArrowLeft, Loader2, Pencil, Save, Plus, Trash2, Check } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<any>(null)
  const [isEditingDNI, setIsEditingDNI] = useState(false)
  const [dni, setDni] = useState("")
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "Spain",
    phone: "",
  })

  useEffect(() => {
    loadCustomer()
  }, [params.id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCustomerById(params.id)
      setCustomer(data)
      setEditedCustomer(data)

      // Buscar el DNI en los metafields
      const dniMetafield = data.metafields.find((m: any) => m.namespace === "customer" && m.key === "dni")
      setDni(dniMetafield?.value || "")
    } catch (error) {
      console.error("Error loading customer:", error)
      setError(`Error al cargar el cliente: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedCustomer((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setEditedCustomer((prev: any) => ({
      ...prev,
      acceptsMarketing: checked,
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Preparar los datos para la API
      const customerData = {
        firstName: editedCustomer.firstName,
        lastName: editedCustomer.lastName,
        email: editedCustomer.email,
        phone: editedCustomer.phone,
        acceptsMarketing: editedCustomer.acceptsMarketing,
        note: editedCustomer.note,
        tags: editedCustomer.tags,
      }

      await updateCustomer(params.id, customerData)

      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se han actualizado correctamente",
      })

      setIsEditing(false)
      loadCustomer() // Recargar los datos actualizados
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el cliente: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDNI = async () => {
    try {
      setIsSaving(true)
      await saveCustomerDNI(params.id, dni)

      toast({
        title: "DNI guardado",
        description: "El DNI se ha guardado correctamente",
      })

      setIsEditingDNI(false)
      loadCustomer() // Recargar los datos actualizados
    } catch (error) {
      console.error("Error saving DNI:", error)
      toast({
        title: "Error",
        description: `No se pudo guardar el DNI: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCountryChange = (value: string) => {
    setNewAddress((prev) => ({
      ...prev,
      country: value,
    }))
  }

  const handleAddAddress = async () => {
    try {
      setIsSaving(true)
      await updateCustomerAddress(params.id, newAddress)

      toast({
        title: "Dirección añadida",
        description: "La dirección se ha añadido correctamente",
      })

      setIsAddingAddress(false)
      setNewAddress({
        address1: "",
        address2: "",
        city: "",
        province: "",
        zip: "",
        country: "Spain",
        phone: "",
      })

      loadCustomer() // Recargar los datos actualizados
    } catch (error) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: `No se pudo añadir la dirección: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsSaving(true)
      await deleteCustomerAddress(params.id, addressId)

      toast({
        title: "Dirección eliminada",
        description: "La dirección se ha eliminado correctamente",
      })

      loadCustomer() // Recargar los datos actualizados
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar la dirección: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsSaving(true)
      await setDefaultCustomerAddress(params.id, addressId)

      toast({
        title: "Dirección predeterminada",
        description: "La dirección se ha establecido como predeterminada",
      })

      loadCustomer() // Recargar los datos actualizados
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: `No se pudo establecer la dirección predeterminada: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando información del cliente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/customers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar el cliente</CardTitle>
            <CardDescription>No se pudo cargar la información del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={loadCustomer}>Reintentar</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditedCustomer(customer) // Restaurar datos originales
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="addresses">Direcciones</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="metafields">Metadatos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Datos personales del cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <div className="font-medium">{customer.firstName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Apellidos</Label>
                    <div className="font-medium">{customer.lastName}</div>
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
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingDNI(true)}>
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </Label>
                    {!isEditingDNI ? (
                      <div className="font-medium">{dni || "No registrado"}</div>
                    ) : (
                      <div className="flex gap-2">
                        <Input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Introduce el DNI" />
                        <Button onClick={handleSaveDNI} disabled={isSaving} size="sm">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Guardar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingDNI(false)}>
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Marketing</Label>
                    <div className="font-medium">
                      {customer.acceptsMarketing ? "Acepta comunicaciones" : "No acepta comunicaciones"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={editedCustomer.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={editedCustomer.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editedCustomer.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={editedCustomer.phone || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="note">Notas</Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={editedCustomer.note || ""}
                      onChange={handleChange}
                      placeholder="Añade notas sobre este cliente..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acceptsMarketing"
                        checked={editedCustomer.acceptsMarketing}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="acceptsMarketing">Acepta recibir comunicaciones de marketing</Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{customer.ordersCount}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Total gastado</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">
                      {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Etiquetas</CardTitle>
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

        <TabsContent value="addresses" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Direcciones</h2>
            <Button onClick={() => setIsAddingAddress(true)} disabled={isAddingAddress}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir dirección
            </Button>
          </div>

          {isAddingAddress && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Nueva dirección</CardTitle>
                <CardDescription>Añade una nueva dirección para este cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">Dirección</Label>
                  <Input
                    id="address1"
                    name="address1"
                    value={newAddress.address1}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Apartamento, suite, etc.</Label>
                  <Input id="address2" name="address2" value={newAddress.address2} onChange={handleAddressChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" name="city" value={newAddress.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      name="province"
                      value={newAddress.province}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">Código postal</Label>
                    <Input id="zip" name="zip" value={newAddress.zip} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Select value={newAddress.country} onValueChange={handleCountryChange}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spain">España</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="France">Francia</SelectItem>
                        <SelectItem value="Italy">Italia</SelectItem>
                        <SelectItem value="Germany">Alemania</SelectItem>
                        <SelectItem value="United Kingdom">Reino Unido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressPhone">Teléfono de contacto</Label>
                  <Input id="addressPhone" name="phone" value={newAddress.phone} onChange={handleAddressChange} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAddress} disabled={isSaving || !newAddress.address1 || !newAddress.city}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Añadir dirección
                </Button>
              </CardFooter>
            </Card>
          )}

          {customer.addresses && customer.addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.map((address: any, index: number) => (
                <Card key={address.id || index}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        {address.id === customer.defaultAddress?.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Predeterminada
                          </span>
                        )}
                        Dirección {index + 1}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {address.id !== customer.defaultAddress?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefaultAddress(address.id)}
                          title="Establecer como predeterminada"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive" title="Eliminar dirección">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente esta dirección.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Este cliente no tiene direcciones registradas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>Historial de pedidos del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                La información de pedidos se cargará desde la sección de pedidos
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metafields" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
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
                <div className="text-center py-8 text-muted-foreground">
                  Este cliente no tiene metadatos adicionales
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
