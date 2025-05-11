"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LoadingState } from "@/components/loading-state"
import { fetchCustomers } from "@/lib/api/customers"
import { formatDate } from "@/lib/utils"
import { Search, UserPlus } from "lucide-react"

export default function CustomersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const customersPerPage = 10

  useEffect(() => {
    const getCustomersList = async () => {
      if (!session?.user) return

      setLoading(true)
      try {
        // Usamos la función fetchCustomers directamente
        const data = await fetchCustomers(50)

        if (data && data.length > 0) {
          // Filtramos y ordenamos los clientes en el cliente
          let filteredCustomers = [...data]

          // Aplicar búsqueda si hay término
          if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filteredCustomers = filteredCustomers.filter(
              (customer) =>
                (customer.firstName && customer.firstName.toLowerCase().includes(term)) ||
                (customer.lastName && customer.lastName.toLowerCase().includes(term)) ||
                (customer.email && customer.email.toLowerCase().includes(term)) ||
                (customer.phone && customer.phone.includes(term)),
            )
          }

          // Ordenar clientes
          filteredCustomers.sort((a, b) => {
            if (sortOrder === "asc") {
              return new Date(a.createdAt) - new Date(b.createdAt)
            } else if (sortOrder === "desc") {
              return new Date(b.createdAt) - new Date(a.createdAt)
            } else if (sortOrder === "name_asc") {
              return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
            } else if (sortOrder === "name_desc") {
              return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
            }
            return 0
          })

          // Paginación
          const totalItems = filteredCustomers.length
          setTotalPages(Math.ceil(totalItems / customersPerPage))

          const startIndex = (currentPage - 1) * customersPerPage
          const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + customersPerPage)

          setCustomers(paginatedCustomers)
          setError(null)
        } else {
          setCustomers([])
          setError("No se encontraron clientes")
        }
      } catch (err) {
        console.error("Error al cargar clientes:", err)
        setError("Error al cargar los clientes: " + (err.message || "Intente nuevamente"))
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }

    getCustomersList()
  }, [session, currentPage, searchTerm, sortOrder])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleCustomerClick = (customerId) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  if (loading) {
    return <LoadingState message="Cargando clientes..." />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda Shopify</p>
        </div>
        <Button onClick={() => router.push("/dashboard/customers/new")}>
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los clientes</CardTitle>
          <CardDescription>
            {customers.length > 0
              ? `Mostrando ${customers.length} de ${totalPages * customersPerPage} clientes`
              : "No se encontraron clientes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Más recientes primero</SelectItem>
                  <SelectItem value="asc">Más antiguos primero</SelectItem>
                  <SelectItem value="name_asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nombre (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{error}</div>}

          {customers.length > 0 ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Fecha registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleCustomerClick(customer.id)}
                      >
                        <TableCell className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>
                          {customer.ordersCount > 0 ? (
                            <Badge variant="outline">{customer.ordersCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCustomerClick(customer.id)
                            }}
                          >
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={currentPage === pageNum} onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : !loading && !error ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron clientes</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSortOrder("desc")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
