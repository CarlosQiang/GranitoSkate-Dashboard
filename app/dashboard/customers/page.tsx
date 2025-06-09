"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Users, Euro, Mail, AlertTriangle, Search, Eye, UserPlus, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { ResponsivePageContainer } from "@/components/responsive-page-container"

export default function CustomersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customersData, setCustomersData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [ordersFilter, setOrdersFilter] = useState("all")

  const loadCustomersData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("👥 Loading customers data...")

      const response = await fetch("/api/customers/summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Customers API error: ${response.status}`)
      }

      const result = await response.json()

      console.log("✅ Customers data loaded successfully:", result)
      setCustomersData(result.data)

      if (!result.success && result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error("❌ Error loading customers:", err)
      setError(err instanceof Error ? err.message : "Error loading customers")

      // Datos de fallback
      setCustomersData({
        stats: {
          totalCustomers: 0,
          verifiedEmails: 0,
          totalSpent: "0.00",
          averageOrders: "0",
          currency: "EUR",
        },
        customers: [],
        topCustomers: [],
        recentCustomers: [],
        byOrderCount: {},
        pageInfo: { hasNextPage: false, endCursor: null },
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomersData()
  }, [loadCustomersData])

  // Filtrar clientes
  const filteredCustomers =
    customersData?.customers?.filter((customer: any) => {
      const matchesSearch =
        !searchTerm ||
        customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && customer.verifiedEmail) ||
        (verificationFilter === "unverified" && !customer.verifiedEmail)

      const matchesOrders =
        ordersFilter === "all" ||
        (ordersFilter === "no-orders" && (customer.ordersCount || 0) === 0) ||
        (ordersFilter === "has-orders" && (customer.ordersCount || 0) > 0)

      return matchesSearch && matchesVerification && matchesOrders
    }) || []

  if (isLoading) {
    return (
      <ResponsivePageContainer>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsivePageContainer>
    )
  }

  return (
    <ResponsivePageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-sm text-muted-foreground">Gestiona y supervisa todos los clientes de tu tienda</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={loadCustomersData} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar Clientes
            </Button>
            <Link href="/dashboard/customers/new">
              <Button variant="outline" className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-l-4 border-amber-500 bg-amber-50">
            <CardContent className="pt-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-800 break-words">{error}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Algunos datos pueden estar incompletos. Puedes intentar actualizar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersData?.stats?.totalCustomers || 0}</div>
              <p className="text-xs text-gray-500">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Verificados</CardTitle>
              <Mail className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersData?.stats?.verifiedEmails || 0}</div>
              <p className="text-xs text-gray-500">
                {customersData?.stats?.totalCustomers > 0
                  ? `${Math.round((customersData.stats.verifiedEmails / customersData.stats.totalCustomers) * 100)}% verificados`
                  : "0% verificados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <Euro className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{customersData?.stats?.totalSpent || "0.00"}</div>
              <p className="text-xs text-gray-500">Por todos los clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Promedio</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersData?.stats?.averageOrders || "0"}</div>
              <p className="text-xs text-gray-500">Por cliente</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verificación Email</label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="verified">Verificados</SelectItem>
                    <SelectItem value="unverified">Sin verificar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pedidos</label>
                <Select value={ordersFilter} onValueChange={setOrdersFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="has-orders">Con pedidos</SelectItem>
                    <SelectItem value="no-orders">Sin pedidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                <div className="text-sm text-gray-600 py-2">
                  {filteredCustomers.length} de {customersData?.customers?.length || 0} clientes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredCustomers.length > 0
                ? `Mostrando ${filteredCustomers.length} clientes`
                : "No se encontraron clientes con los filtros aplicados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid gap-4">
                    {filteredCustomers.map((customer: any) => (
                      <div key={customer.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {customer.firstName} {customer.lastName}
                              </h3>
                              {customer.verifiedEmail && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-semibold">€{customer.totalSpent?.amount || "0.00"}</div>
                              <div className="text-xs text-gray-500">{customer.ordersCount || 0} pedidos</div>
                              <div className="text-xs text-gray-500">
                                {new Date(customer.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {customer.defaultAddress && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Dirección:</span> {customer.defaultAddress.address1},{" "}
                            {customer.defaultAddress.city}
                            {customer.defaultAddress.province && `, ${customer.defaultAddress.province}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
                <p className="text-gray-500">
                  {customersData?.customers?.length === 0
                    ? "No se han encontrado clientes en tu tienda."
                    : "No hay clientes que coincidan con los filtros aplicados."}
                </p>
                <Link href="/dashboard/customers/new">
                  <Button className="mt-4">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Primer Cliente
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsivePageContainer>
  )
}
