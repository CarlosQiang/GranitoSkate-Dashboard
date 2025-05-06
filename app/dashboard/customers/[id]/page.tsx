import { Suspense } from "react"
import { fetchCustomerById } from "@/lib/api/customers"
import { formatDate, formatCurrency } from "@/lib/utils"
import { CustomerAddressCard } from "@/components/customer-address-card"
import { CustomerAddressForm } from "@/components/customer-address-form"
import { CustomerOrdersList } from "@/components/customer-orders-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { ArrowLeft, Edit, Trash2, User } from "lucide-react"
import Link from "next/link"

interface CustomerPageProps {
  params: {
    id: string
  }
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const customer = await fetchCustomerById(params.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/customers/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente este cliente y todos sus datos
                  asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-orange-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p>
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p>{customer.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente desde</p>
                  <p>{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pedidos realizados</p>
                  <p>{customer.ordersCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total gastado</p>
                  <p>{formatCurrency(customer.totalSpent || 0)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="addresses">Direcciones</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-4">
              <Suspense fallback={<div>Cargando pedidos...</div>}>
                <CustomerOrdersList customerId={params.id} />
              </Suspense>
            </TabsContent>
            <TabsContent value="addresses" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((address) => (
                    <CustomerAddressCard
                      key={address.id}
                      customerId={params.id}
                      address={address}
                      isDefault={customer.defaultAddress && customer.defaultAddress.id === address.id}
                      onAddressUpdated={() => {}}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-muted-foreground">Este cliente no tiene direcciones registradas.</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <CustomerAddressForm customerId={params.id} onAddressAdded={() => {}} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
