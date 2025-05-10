import { Suspense } from "react"
import Link from "next/link"
import { getCustomers } from "@/lib/api/customers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Eye, UserPlus } from "lucide-react"

// Componente para cargar los clientes
async function CustomersList() {
  try {
    const { customers } = await getCustomers(10)

    if (!customers || customers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No hay clientes disponibles</p>
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacto</p>
                  <p className="text-sm">{customer.email}</p>
                  {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
                  <p className="text-sm">{customer.ordersCount} pedidos</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total gastado</p>
                  <p className="text-sm font-medium">{customer.totalSpent}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/customers/${customer.id.split("/").pop()}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error al cargar la lista de clientes:", error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error al cargar los clientes. Por favor, inténtalo de nuevo.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    )
  }
}

// Componente de carga
function CustomersLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<CustomersLoading />}>
        <CustomersList />
      </Suspense>
    </div>
  )
}
