"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  MoreHorizontal,
  Pencil,
  ShoppingCart,
  UserPlus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react"
import { fetchCustomers, deleteCustomer } from "@/lib/api/customers"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer } from "@/types/customers"

export default function CustomersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch customers function
  const getCustomers = useCallback(
    async (searchQuery = "", cursor: string | null = null, direction: "next" | "prev" = "next") => {
      setIsLoading(true)
      setIsError(false)

      try {
        const data = await fetchCustomers(20, searchQuery, direction === "next" ? cursor : null)
        setCustomers(data.customers)
        setHasNextPage(data.pageInfo.hasNextPage)
        setHasPreviousPage(data.pageInfo.hasPreviousPage)
        setCursor(data.pageInfo.hasNextPage ? data.pageInfo.endCursor : null)
      } catch (error: any) {
        console.error("Error fetching customers:", error)
        setIsError(true)
        setErrorMessage(error.message || "No se pudieron cargar los clientes")
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Fetch customers when search query changes
  useEffect(() => {
    getCustomers(debouncedSearchQuery)
  }, [debouncedSearchQuery, getCustomers])

  const loadNextPage = () => {
    if (!hasNextPage || !cursor) return
    getCustomers(debouncedSearchQuery, cursor, "next")
  }

  const loadPreviousPage = () => {
    if (!hasPreviousPage) return
    getCustomers(debouncedSearchQuery, null, "prev")
  }

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await deleteCustomer(customerToDelete)

      // Remove customer from list
      setCustomers(customers.filter((customer) => customer.id !== customerToDelete))

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente",
      })
    } catch (error: any) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setCustomerToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleRetry = () => {
    getCustomers(debouncedSearchQuery)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>
        <Button onClick={() => router.push("/dashboard/customers/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      <div className="flex items-center justify-between">
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

      {isError ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error al cargar los clientes
            </CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry}>Reintentar</Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
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
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </div>
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {customer.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{customer.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {customer.email}
                        {customer.verifiedEmail && (
                          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem
                            onClick={() => confirmDelete(customer.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {(hasNextPage || hasPreviousPage) && (
            <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
              <Button variant="outline" size="sm" onClick={loadPreviousPage} disabled={!hasPreviousPage || isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={loadNextPage} disabled={!hasNextPage || isLoading}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

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
              onClick={handleDeleteCustomer}
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
