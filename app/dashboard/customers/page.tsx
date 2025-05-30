"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { CustomerFilters, type CustomerFilter } from "@/components/customer-filters"
import { ExportCustomers } from "@/components/export-customers"
import { fetchCustomers, type CustomerFilters as ApiCustomerFilters } from "@/lib/api/customers"
import { formatDate, formatCurrency } from "@/lib/utils"
import { MoreHorizontal, Pencil, ShoppingCart, UserPlus, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerDetail } from "@/components/customer-detail"

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
  updatedAt: string
  verifiedEmail: boolean
  defaultAddress: any
  addresses: any[]
  tags: string[]
  metafields: any[]
  cursor: string
}

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<CustomerFilter>({
    query: searchParams.get("query") || "",
    sortKey: "CREATED_AT",
    reverse: false,
    dateFrom: null,
    dateTo: null,
    hasOrders: null,
    hasVerifiedEmail: null,
    tags: [],
    hasDNI: null,
  })

  const buildApiFilters = useCallback((): ApiCustomerFilters => {
    let query = filters.query || ""

    // Añadir filtros avanzados a la consulta
    if (filters.hasOrders === true) {
      query += " orders_count:>0"
    } else if (filters.hasOrders === false) {
      query += " orders_count:0"
    }

    if (filters.hasVerifiedEmail === true) {
      query += " email_verified:true"
    } else if (filters.hasVerifiedEmail === false) {
      query += " email_verified:false"
    }

    if (filters.dateFrom) {
      query += ` created_at:>=${filters.dateFrom.toISOString().split("T")[0]}`
    }

    if (filters.dateTo) {
      query += ` created_at:<=${filters.dateTo.toISOString().split("T")[0]}`
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        query += ` tag:${tag}`
      })
    }

    if (filters.hasDNI === true) {
      query += " tag:dni-*"
    }

    return {
      query,
      sortKey: filters.sortKey,
      reverse: filters.reverse,
      first: 20,
      after: null,
    }
  }, [filters])

  const loadCustomers = useCallback(
    async (resetList = true) => {
      try {
        setIsLoading(resetList)
        if (!resetList) setIsLoadingMore(true)
        setError(null)

        const apiFilters = buildApiFilters()
        if (!resetList && endCursor) {
          apiFilters.after = endCursor
        }

        const result = await fetchCustomers(apiFilters)

        if (resetList) {
          setCustomers(result.customers)
        } else {
          setCustomers((prev) => [...prev, ...result.customers])
        }

        setHasNextPage(result.pageInfo.hasNextPage)
        setEndCursor(result.pageInfo.endCursor)
      } catch (error) {
        console.error("Error fetching customers:", error)
        setError(`No se pudieron cargar los clientes: ${(error as Error).message}`)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildApiFilters, endCursor, toast],
  )

  useEffect(() => {
    loadCustomers()
    // Actualizar la URL con los filtros de búsqueda
    if (filters.query) {
      router.push(`/dashboard/customers?query=${encodeURIComponent(filters.query)}`)
    } else {
      router.push("/dashboard/customers")
    }
  }, [filters.query, filters.sortKey, filters.reverse, loadCustomers, router])

  const handleFilterChange = (newFilters: CustomerFilter) => {
    setFilters(newFilters)
  }

  const resetFilters = () => {
    setFilters({
      query: "",
      sortKey: "CREATED_AT",
      reverse: false,
      dateFrom: null,
      dateTo: null,
      hasOrders: null,
      hasVerifiedEmail: null,
      tags: [],
      hasDNI: null,
    })
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }

  const handleCustomerUpdated = () => {
    loadCustomers()
    setIsDetailOpen(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <ExportCustomers filters={buildApiFilters()} />
          <Button
            variant="default"
            onClick={() => router.push("/dashboard/customers/new")}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo cliente
          </Button>
        </div>
      </div>

      <CustomerFilters filters={filters} onFilterChange={handleFilterChange} onReset={resetFilters} />

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm break-words">{error}</p>
          <Button variant="outline" size="sm" onClick={() => loadCustomers()} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Nombre</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Teléfono</TableHead>
                  <TableHead className="min-w-[80px]">Pedidos</TableHead>
                  <TableHead className="min-w-[120px]">Total gastado</TableHead>
                  <TableHead className="min-w-[120px]">Fecha de registro</TableHead>
                  <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
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
                      <Skeleton className="h-4 w-24" />
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
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Nombre</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Teléfono</TableHead>
                  <TableHead className="min-w-[80px]">Pedidos</TableHead>
                  <TableHead className="min-w-[120px]">Total gastado</TableHead>
                  <TableHead className="min-w-[120px]">Fecha de registro</TableHead>
                  <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <TableCell>
                        <div className="font-medium break-words">
                          {customer.firstName} {customer.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="break-all">{customer.email}</span>
                          {customer.verifiedEmail && (
                            <span
                              className="ml-2 h-2 w-2 rounded-full bg-green-500 flex-shrink-0"
                              title="Email verificado"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>{customer.ordersCount}</TableCell>
                      <TableCell>
                        {formatCurrency(customer.totalSpent.amount, customer.totalSpent.currencyCode)}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetails(customer)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/dashboard/customers/${customer.id}/orders`)
                              }}
                            >
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

          {hasNextPage && (
            <div className="flex justify-center p-4">
              <Button variant="outline" onClick={() => loadCustomers(false)} disabled={isLoadingMore}>
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más clientes"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedCustomer && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del cliente</DialogTitle>
              <DialogDescription>
                Información completa de {selectedCustomer.firstName} {selectedCustomer.lastName}
              </DialogDescription>
            </DialogHeader>

            <CustomerDetail customer={selectedCustomer} onUpdate={handleCustomerUpdated} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
