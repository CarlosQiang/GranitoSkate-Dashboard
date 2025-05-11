"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchCustomerById, updateCustomer, deleteCustomer } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Save, Trash2, ShoppingBag, MapPin, Tag, Plus, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CustomerAddressCard } from "@/components/customer-address-card"
import { CustomerOrdersList } from "@/components/customer-orders-list"
import { CustomerAddressForm } from "@/components/customer-address-form"

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
    acceptsMarketing: false,
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    const getCustomer = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCustomerById(params.id)
        setCustomer(data)
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          note: data.note || "",
          acceptsMarketing: data.acceptsMarketing || false,
          tags: data.tags || [],
        })
      } catch (error) {
        console.error("Error fetching customer:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del cliente",
          variant: "destructive",
        })
        router.push("/dashboard/customers")
      } finally {
        setIsLoading(false)
      }
    }

    getCustomer()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptsMarketing: checked }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const updatedCustomer = await updateCustomer(params.id, formData)

      toast({
        title: "Cliente actualizado",
        description: "La información del cliente ha sido actualizada correctamente",
      })

      // Update local state with new data
      setCustomer((prev: any) => ({
        ...prev,
        ...updatedCustomer,
      }))
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del cliente",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCustomer(params.id)

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente",
      })

      router.push("/dashboard/customers")
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cargando cliente...</h1>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar cliente
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="addresses">Direcciones</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Información del cliente</CardTitle>
                <CardDescription>Edita la información básica del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notas</Label>
                  <Textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={4} />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="acceptsMarketing"
                    checked={formData.acceptsMarketing}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="acceptsMarketing">Acepta marketing por email</Label>
                </div>

                <div className="space-y-2">
                  <Label>Etiquetas</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Añadir etiqueta"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Añadir
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>Guardando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Información adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Cliente desde</p>
                  <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Última actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.updatedAt ? formatDate(customer.updatedAt) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total de pedidos</p>
                  <p className="text-sm text-muted-foreground">{customer.ordersCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total gastado</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.totalSpent
                      ? formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)
                      : "€0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Pedidos del cliente
              </CardTitle>
              <CardDescription>Historial de pedidos realizados por este cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerOrdersList customerId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Direcciones
                  </CardTitle>
                  <CardDescription>Direcciones guardadas del cliente</CardDescription>
                </div>
                <Button onClick={() => setShowAddressForm(!showAddressForm)}>
                  {showAddressForm ? "Cancelar" : "Añadir dirección"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddressForm ? (
                <CustomerAddressForm
                  customerId={params.id}
                  onSuccess={() => {
                    setShowAddressForm(false)
                    router.refresh()
                  }}
                  onCancel={() => setShowAddressForm(false)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses && customer.addresses.length > 0 ? (
                    customer.addresses.map((address: any) => (
                      <CustomerAddressCard
                        key={address.id}
                        address={address}
                        customerId={params.id}
                        isDefault={customer.defaultAddress && customer.defaultAddress.id === address.id}
                      />
                    ))
                  ) : (
                    <p className="col-span-2 text-center py-8 text-muted-foreground">
                      Este cliente no tiene direcciones guardadas
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado permanentemente de tu tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
