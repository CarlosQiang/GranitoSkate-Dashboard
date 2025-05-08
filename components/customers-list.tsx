"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchCustomers } from "@/lib/api/customers"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReloadIcon, SearchIcon, PlusIcon, UserIcon } from "@radix-ui/react-icons"

export default function CustomersList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const loadCustomers = async (query = "") => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchCustomers(20, query)
      setCustomers(response.customers)
    } catch (err) {
      console.error("Error loading customers:", err)
      setError(err.message || "Error al cargar los clientes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // Debounce para evitar demasiadas peticiones
    const timeoutId = setTimeout(() => {
      loadCustomers(e.target.value)
    }, 500)
    return () => clearTimeout(timeoutId)
  }

  const handleRetry = () => {
    loadCustomers(searchQuery)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clientes</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={() => router.push("/dashboard/customers/new")} className="bg-brand hover:bg-brand-dark">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
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
                className="h-6 w-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Error al cargar los clientes</h3>
            <p className="mb-4 text-gray-500">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-1">
              <ReloadIcon className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand"></div>
              <span>Cargando clientes...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3 text-gray-600">
              <UserIcon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">No se encontraron clientes</h3>
            <p className="mb-4 text-gray-500">
              {searchQuery
                ? `No hay resultados para "${searchQuery}"`
                : "Aún no hay clientes registrados en tu tienda."}
            </p>
            <Button onClick={() => router.push("/dashboard/customers/new")} className="bg-brand hover:bg-brand-dark">
              <PlusIcon className="mr-2 h-4 w-4" />
              Crear nuevo cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || "—"}</TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={customer.verifiedEmail ? "success" : "secondary"}>
                        {customer.verifiedEmail ? "Verificado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
