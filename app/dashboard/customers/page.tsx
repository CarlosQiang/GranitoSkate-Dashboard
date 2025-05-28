"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Filter,
  Grid3X3,
  List,
} from "lucide-react"
import { fetchCustomers } from "@/lib/api/customers"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("table")
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setViewMode("cards")
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const loadCustomers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
      filterCustomers(data, searchTerm)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      setError("No se pudieron cargar los clientes. Intente nuevamente más tarde.")
      toast({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCustomers = (customersData, search) => {
    let filtered = [...customersData]

    if (search) {
      filtered = filtered.filter(
        (customer) =>
          customer.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          customer.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          customer.email?.toLowerCase().includes(search.toLowerCase()) ||
          customer.phone?.includes(search),
      )
    }

    setFilteredCustomers(filtered)
  }

  useEffect(() => {
    loadCustomers()

    const savedViewMode = localStorage.getItem("customersViewMode")
    if (savedViewMode && !isMobile) {
      setViewMode(savedViewMode)
    }
  }, [isMobile])

  useEffect(() => {
    filterCustomers(customers, searchTerm)
  }, [searchTerm, customers])

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("customersViewMode", viewMode)
    }
  }, [viewMode, isMobile])

  const syncCustomers = async () => {
    setIsSyncing(true)
    setError(null)
    try {
      const response = await fetch("/api/sync/customers")
      if (!response.ok) {
        throw new Error("Error al sincronizar clientes")
      }

      toast({
        title: "Sincronización completada",
        description: "Los clientes se han sincronizado correctamente con Shopify.",
      })

      await loadCustomers()
    } catch (error) {
      console.error("Error al sincronizar clientes:", error)
      setError("No se pudieron sincronizar los clientes. Intente nuevamente más tarde.")
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los clientes. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const getCustomerInitials = (customer) => {
    const firstName = customer.firstName || ""
    const lastName = customer.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getCustomerStatus = (customer) => {
    if (customer.acceptsMarketing) return "Suscrito"
    if (customer.ordersCount > 0) return "Cliente"
    return "Prospecto"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Suscrito":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Cliente":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header responsive */}
      <div className="flex-responsive-between">
        <div>
          <h1 className="heading-responsive">Clientes</h1>
          <p className="caption-responsive mt-1">Gestiona los clientes de tu tienda</p>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="outline" onClick={() => setShowMobileFilters(!showMobileFilters)} size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => router.push("/dashboard/customers/new")}
            className="bg-granito-500 hover:bg-granito-600 text-white mobile-full-width sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="mobile-only">Nuevo</span>
            <span className="tablet-up">Nuevo cliente</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b card-responsive">
          <div className="flex-responsive-between">
            <div>
              <CardTitle className="subheading-responsive">Base de clientes</CardTitle>
              <CardDescription className="caption-responsive">
                Gestiona la información y historial de tus clientes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={syncCustomers}
                disabled={isSyncing}
                variant="outline"
                className="border-granito-300 hover:bg-granito-50"
                size={isMobile ? "sm" : "default"}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span className="mobile-only">Sync...</span>
                    <span className="tablet-up">Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span className="mobile-only">Sync</span>
                    <span className="tablet-up">Sincronizar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="card-responsive">
          <div className="space-y-4">
            {/* Controles de búsqueda y vista */}
            <div className="flex-responsive-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {!isMobile && (
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("px-2 rounded-none", viewMode === "table" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => setViewMode("table")}
                    aria-label="Vista de tabla"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("px-2 rounded-none", viewMode === "cards" && "bg-gray-100 dark:bg-gray-800")}
                    onClick={() => setViewMode("cards")}
                    aria-label="Vista de tarjetas"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md"
                role="alert"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Contenido principal */}
            {isLoading ? (
              <CustomersSkeleton viewMode={viewMode} isMobile={isMobile} />
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="subheading-responsive">No se encontraron clientes</h3>
                <p className="caption-responsive mt-1 mb-4">
                  {searchTerm ? `No hay resultados para "${searchTerm}"` : "No hay clientes registrados"}
                </p>
                <Button
                  onClick={() => router.push("/dashboard/customers/new")}
                  className="bg-granito-500 hover:bg-granito-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir primer cliente
                </Button>
              </div>
            ) : viewMode === "table" && !isMobile ? (
              <CustomersTable customers={filteredCustomers} />
            ) : (
              <CustomersCards customers={filteredCustomers} isMobile={isMobile} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomersSkeleton({ viewMode, isMobile }) {
  if (viewMode === "table" && !isMobile) {
    return (
      <div className="table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CustomersTable({ customers }) {
  return (
    <div className="table-responsive">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-granito-100 flex items-center justify-center text-granito-700 font-medium">
                    {getCustomerInitials(customer)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">Cliente desde {formatDate(customer.createdAt)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {customer.email}
                </div>
              </TableCell>
              <TableCell>
                {customer.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {customer.phone}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{customer.ordersCount || 0}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(getCustomerStatus(customer))}>{getCustomerStatus(customer)}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/customers/${customer.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CustomersCards({ customers, isMobile }) {
  return (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  )
}

function CustomerCard({ customer }) {
  return (
    <Link href={`/dashboard/customers/${customer.id}`}>
      <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-granito-100 flex items-center justify-center text-granito-700 font-medium">
              {getCustomerInitials(customer)}
            </div>
            <div>
              <div className="font-medium">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="text-sm text-muted-foreground">Cliente desde {formatDate(customer.createdAt)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{customer.email}</span>
            </div>

            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}

            {customer.defaultAddress && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {customer.defaultAddress.city}, {customer.defaultAddress.country}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="text-xs">
                {customer.ordersCount || 0} pedidos
              </Badge>
              <Badge className={cn("text-xs", getStatusColor(getCustomerStatus(customer)))}>
                {getCustomerStatus(customer)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getCustomerInitials(customer) {
  const firstName = customer.firstName || ""
  const lastName = customer.lastName || ""
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getCustomerStatus(customer) {
  if (customer.acceptsMarketing) return "Suscrito"
  if (customer.ordersCount > 0) return "Cliente"
  return "Prospecto"
}

function getStatusColor(status) {
  switch (status) {
    case "Suscrito":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Cliente":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}
