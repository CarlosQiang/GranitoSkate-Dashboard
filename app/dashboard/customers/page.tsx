"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreHorizontal, Pencil, ShoppingCart } from "lucide-react"
import { fetchCustomers } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { fallbackCustomers } from "@/components/fallback-data-provider"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  ordersCount: number
  totalSpent: {
    amount: string
    currencyCode: string
  }
  createdAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { useFallbackData } = useFallbackData()

  useEffect(() => {
    const getCustomers = async () => {
      try {
        if (useFallbackData) {
          // Usar datos de fallback si es necesario
          setCustomers(fallbackCustomers as Customer[])
          setIsLoading(false)
          return
        }

        const data = await fetchCustomers()

        if (data && data.length > 0) {
          setCustomers(data)
          setError(null)
        } else {
          // Si no hay datos, mostrar un mensaje y usar datos de fallback
          setError("No se pudieron cargar los clientes. Mostrando datos de ejemplo.")
          setCustomers(fallbackCustomers as Customer[])
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
        setError("Error al cargar los clientes. Mostrando datos de ejemplo.")
        setCustomers(fallbackCustomers as Customer[])
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes. Mostrando datos de ejemplo.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getCustomers()
  }, [toast, useFallbackData])

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total gastado</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total gastado</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell>
                      {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}/orders`)}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Ver pedidos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
