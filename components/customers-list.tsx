"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { type Customer, getCustomers } from "@/lib/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Search, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Efecto para cargar los clientes
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCustomers(debouncedQuery)
        setCustomers(data)
      } catch (err) {
        console.error("Error al cargar clientes:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar clientes")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [debouncedQuery])

  const handleRetry = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomers(debouncedQuery)
      setCustomers(data)
    } catch (err) {
      console.error("Error al reintentar cargar clientes:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar clientes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/customers/new">
            <User className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar los clientes</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-10 w-[100px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No se encontraron clientes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {customer.email} {customer.phone && `• ${customer.phone}`}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Pedidos: {customer.ordersCount} • Total gastado: {customer.totalSpent}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/customers/${customer.id.split("/").pop()}`}>Ver detalles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
