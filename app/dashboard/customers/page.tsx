import { Suspense } from "react"
import { Users, UserPlus, RefreshCw } from "lucide-react" // Cambiado de @radix-ui/react-icons a lucide-react

import { CustomersList } from "@/components/customers-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de ejemplo
const mockCustomers = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@example.com",
    orders: 5,
    totalSpent: 450.75,
  },
  {
    id: "2",
    name: "María López",
    email: "maria@example.com",
    orders: 3,
    totalSpent: 320.5,
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    orders: 8,
    totalSpent: 780.25,
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana@example.com",
    orders: 2,
    totalSpent: 150.0,
  },
  {
    id: "5",
    name: "Pedro González",
    email: "pedro@example.com",
    orders: 6,
    totalSpent: 520.3,
  },
]

async function getCustomers() {
  // En un entorno real, esto sería una llamada a la API
  // Por ahora, simulamos un retraso y devolvemos datos de ejemplo
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockCustomers
}

function CustomersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">+2 desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3</div>
            <p className="text-xs text-muted-foreground">+1 desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Gasto Promedio</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$444.36</div>
            <p className="text-xs text-muted-foreground">+$65.25 desde el último mes</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<CustomersLoading />}>
        <CustomersList customers={customers} />
      </Suspense>
    </div>
  )
}
