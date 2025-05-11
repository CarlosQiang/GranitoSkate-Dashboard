"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  MoreHorizontal,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Tag,
  Download,
  Printer,
} from "lucide-react"
import { fetchOrders, type OrderFilter } from "@/lib/api/orders"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Order {
  id: string
  name: string
  processedAt: string
  fulfillmentStatus: string
  financialStatus: string
  totalPrice: string
  customer: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
  tags: string[]
  cursor: string
}

interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState<OrderFilter>({
    sortKey: "PROCESSED_AT",
    reverse: true,
    first: 20,
  })

  // Cargar filtros desde URL
  useEffect(() => {
    const query = searchParams.get("query") || ""
    const status = searchParams.get("status") || "ANY"
    const financialStatus = searchParams.get("financialStatus") || ""
    const fulfillmentStatus = searchParams.get("fulfillmentStatus") || ""
    const sortKey = searchParams.get("sortKey") || "PROCESSED_AT"
    const reverse = searchParams.get("reverse") !== "false"
    const cursor = searchParams.get("cursor") || ""
    const tab = searchParams.get("tab") || "all"

    setSearchQuery(query)
    setFilters({
      query,
      status: status as any,
      financialStatus,
      fulfillmentStatus,
      sortKey: sortKey as any,
      reverse,
      cursor,
      first: 20,
    })
    setActiveTab(tab)
  }, [searchParams])

  // Cargar pedidos
  useEffect(() => {
    const getOrders = async () => {
      try {
        setIsLoading(true)
        const { orders: fetchedOrders, pageInfo: fetchedPageInfo } = await fetchOrders(filters)
        setOrders(fetchedOrders)
        setPageInfo(fetchedPageInfo)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getOrders()
  }, [filters, toast])

  // Actualizar URL con filtros
  const updateUrlWithFilters = (newFilters: Partial<OrderFilter>, tab?: string) => {
    const updatedFilters = { ...filters, ...newFilters }
    const params = new URLSearchParams()

    if (updatedFilters.query) params.set("query", updatedFilters.query)
    if (updatedFilters.status && updatedFilters.status !== "ANY") params.set("status", updatedFilters.status)
    if (updatedFilters.financialStatus) params.set("financialStatus", updatedFilters.financialStatus)
    if (updatedFilters.fulfillmentStatus) params.set("fulfillmentStatus", updatedFilters.fulfillmentStatus)
    if (updatedFilters.sortKey) params.set("sortKey", updatedFilters.sortKey)
    if (updatedFilters.reverse !== undefined) params.set("reverse", updatedFilters.reverse.toString())
    if (updatedFilters.cursor) params.set("cursor", updatedFilters.cursor)
    if (tab) params.set("tab", tab)

    router.push(`/dashboard/orders?${params.toString()}`)
  }

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    let fulfillmentStatus = ""
    let financialStatus = ""

    switch (value) {
      case "unfulfilled":
        fulfillmentStatus = "UNFULFILLED"
        break
      case "fulfilled":
        fulfillmentStatus = "FULFILLED"
        break
      case "paid":
        financialStatus = "PAID"
        break
      case "unpaid":
        financialStatus = "UNPAID"
        break
    }

    updateUrlWithFilters({ fulfillmentStatus, financialStatus, cursor: "" }, value)
  }

  // Manejar búsqueda
  const handleSearch = () => {
    updateUrlWithFilters({ query: searchQuery, cursor: "" })
  }

  // Manejar paginación
  const handleNextPage = () => {
    if (pageInfo?.hasNextPage) {
      updateUrlWithFilters({ cursor: pageInfo.endCursor })
    }
  }

  const handlePrevPage = () => {
    if (pageInfo?.hasPreviousPage) {
      updateUrlWithFilters({ cursor: pageInfo.startCursor })
    }
  }

  // Manejar ordenación
  const handleSort = (sortKey: string) => {
    const newSortKey = sortKey as any
    const newReverse = filters.sortKey === newSortKey ? !filters.reverse : true
    updateUrlWithFilters({ sortKey: newSortKey, reverse: newReverse, cursor: "" })
  }

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "PARTIALLY_FULFILLED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "REFUNDED":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      case "UNPAID":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Implementar exportación a CSV
              toast({
                title: "Exportando pedidos",
                description: "Los pedidos se están exportando a CSV",
              })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="unfulfilled">Sin enviar</TabsTrigger>
          <TabsTrigger value="fulfilled">Enviados</TabsTrigger>
          <TabsTrigger value="paid">Pagados</TabsTrigger>
          <TabsTrigger value="unpaid">Sin pagar</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar pedidos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Estado del pedido</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ status: "ANY", cursor: "" })}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ status: "OPEN", cursor: "" })}>
                      Abiertos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ status: "CLOSED", cursor: "" })}>
                      Cerrados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ status: "CANCELLED", cursor: "" })}>
                      Cancelados
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Estado de pago</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ financialStatus: "PAID", cursor: "" })}>
                      Pagados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ financialStatus: "PENDING", cursor: "" })}>
                      Pendientes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUrlWithFilters({ financialStatus: "REFUNDED", cursor: "" })}>
                      Reembolsados
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Estado de envío</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => updateUrlWithFilters({ fulfillmentStatus: "FULFILLED", cursor: "" })}
                    >
                      Enviados
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUrlWithFilters({ fulfillmentStatus: "UNFULFILLED", cursor: "" })}
                    >
                      Sin enviar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateUrlWithFilters({ fulfillmentStatus: "PARTIALLY_FULFILLED", cursor: "" })}
                    >
                      Parcialmente enviados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {filters.reverse ? <SortDesc className="mr-2 h-4 w-4" /> : <SortAsc className="mr-2 h-4 w-4" />}
                      Ordenar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSort("PROCESSED_AT")}>
                      Fecha de procesamiento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("UPDATED_AT")}>Última actualización</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("TOTAL_PRICE")}>Precio total</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("ID")}>Número de pedido</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="default" size="sm" onClick={handleSearch}>
                  Buscar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
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
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No se encontraron pedidos
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-medium">{order.name}</div>
                          </TableCell>
                          <TableCell>{formatDate(order.processedAt)}</TableCell>
                          <TableCell>
                            {order.customer ? (
                              <div>
                                <div>
                                  {order.customer.firstName} {order.customer.lastName}
                                </div>
                                {order.customer.email && (
                                  <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Sin cliente</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={getStatusColor(order.fulfillmentStatus)}>
                                {order.fulfillmentStatus.replace("_", " ")}
                              </Badge>
                              <Badge className={getStatusColor(order.financialStatus)}>
                                {order.financialStatus.replace("_", " ")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}/edit`)}>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Editar etiquetas
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Paginación */}
                {pageInfo && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">Mostrando {orders.length} pedidos</div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!pageInfo.hasPreviousPage}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!pageInfo.hasNextPage}>
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
