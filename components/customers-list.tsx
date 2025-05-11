"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Edit, Trash2, Eye, Plus, ShoppingBag } from "lucide-react"
import type { Customer } from "@/types/customers"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { deleteCustomer } from "@/lib/api/customers"
import { formatCurrency, formatDate } from "@/lib/utils"

interface CustomersListProps {
  initialCustomers: Customer[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string
    endCursor?: string
  }
  onSearch: (query: string) => void
  onPageChange: (cursor: string | null, direction: "next" | "prev") => void
}

export function CustomersList({ initialCustomers, pageInfo, onSearch, onPageChange }: CustomersListProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDelete = async () => {
    if (!customerToDelete) return

    setIsLoading(true)
    try {
      await deleteCustomer(customerToDelete.id)
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id))
      setCustomerToDelete(null)
      setIsDeleting(false)
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <Button onClick={() => router.push("/dashboard/customers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
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
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.numberOfOrders || 0}</TableCell>
                    <TableCell>
                      {customer.amountSpent
                        ? formatCurrency(
                            Number.parseFloat(customer.amountSpent.amount || "0"),
                            customer.amountSpent.currencyCode || "USD",
                          )
                        : formatCurrency(0, "USD")}
                    </TableCell>
                    <TableCell>{customer.createdAt ? formatDate(customer.createdAt) : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Abrir menú</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${encodeURIComponent(customer.id)}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver detalles</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${encodeURIComponent(customer.id)}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${encodeURIComponent(customer.id)}/orders`}>
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              <span>Ver pedidos</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCustomerToDelete(customer)
                              setIsDeleting(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageInfo.startCursor || null, "prev")}
              disabled={!pageInfo.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageInfo.endCursor || null, "next")}
              disabled={!pageInfo.hasNextPage}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al cliente{" "}
              <span className="font-semibold">
                {customerToDelete?.firstName} {customerToDelete?.lastName}
              </span>{" "}
              y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
