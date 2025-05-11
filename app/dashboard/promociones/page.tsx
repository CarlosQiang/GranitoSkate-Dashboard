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
import { fetchPromotions } from "@/lib/api/promotions"
import { formatDate } from "@/lib/utils"
import { Plus, Search } from "lucide-react"

export default function PromocionesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const itemsPerPage = 10

  useEffect(() => {
    const getPromotionsList = async () => {
      if (!session?.user) return

      setLoading(true)
      try {
        const data = await fetchPromotions(50)

        if (data && data.length > 0) {
          // Filtrar por término de búsqueda
          let filteredPromotions = [...data]

          if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filteredPromotions = filteredPromotions.filter(
              (promo) =>
                (promo.title && promo.title.toLowerCase().includes(term)) ||
                (promo.code && promo.code.toLowerCase().includes(term)) ||
                (promo.summary && promo.summary.toLowerCase().includes(term)),
            )
          }

          // Filtrar por estado
          if (statusFilter !== "all") {
            filteredPromotions = filteredPromotions.filter((promo) => promo.status.toLowerCase() === statusFilter)
          }

          // Ordenar
          filteredPromotions.sort((a, b) => {
            const dateA = new Date(sortOrder === "desc" ? a.createdAt : b.createdAt)
            const dateB = new Date(sortOrder === "desc" ? b.createdAt : a.createdAt)
            return dateA - dateB
          })

          // Paginación
          const totalItems = filteredPromotions.length
          setTotalPages(Math.ceil(totalItems / itemsPerPage))

          const startIndex = (currentPage - 1) * itemsPerPage
          const paginatedPromotions = filteredPromotions.slice(startIndex, startIndex + itemsPerPage)

          setPromotions(paginatedPromotions)
          setError(null)
        } else {
          setPromotions([])
          setError("No se encontraron promociones")
        }
      } catch (err) {
        console.error("Error al cargar promociones:", err)
        setError("Error al cargar las promociones: " + (err.message || "Intente nuevamente"))
        setPromotions([])
      } finally {
        setLoading(false)
      }
    }

    getPromotionsList()
  }, [session, currentPage, searchTerm, statusFilter, sortOrder])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePromotionClick = (promotionId) => {
    router.push(`/dashboard/promociones/${promotionId}`)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Activa", variant: "success" },
      scheduled: { label: "Programada", variant: "warning" },
      expired: { label: "Expirada", variant: "destructive" },
      disabled: { label: "Desactivada", variant: "secondary" },
    }

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: "default" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return <LoadingState message="Cargando promociones..." />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button onClick={() => router.push("/dashboard/promociones/asistente")}>
          <Plus className="mr-2 h-4 w-4" /> Nueva promoción
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las promociones</CardTitle>
          <CardDescription>
            {promotions.length > 0 ? `Mostrando ${promotions.length} promociones` : "No se encontraron promociones"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar promociones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="scheduled">Programadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="disabled">Desactivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Más recientes primero</SelectItem>
                  <SelectItem value="asc">Más antiguos primero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{error}</div>}

          {promotions.length > 0 ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Fecha inicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promotion) => (
                      <TableRow
                        key={promotion.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handlePromotionClick(promotion.id)}
                      >
                        <TableCell className="font-medium">{promotion.title}</TableCell>
                        <TableCell>{promotion.code || "-"}</TableCell>
                        <TableCell>
                          {promotion.type === "PERCENTAGE_DISCOUNT"
                            ? "Porcentaje"
                            : promotion.type === "FIXED_AMOUNT_DISCOUNT"
                              ? "Importe fijo"
                              : promotion.type === "FREE_SHIPPING"
                                ? "Envío gratis"
                                : promotion.type}
                        </TableCell>
                        <TableCell>
                          {promotion.type === "PERCENTAGE_DISCOUNT"
                            ? `${promotion.value}%`
                            : promotion.type === "FIXED_AMOUNT_DISCOUNT"
                              ? `${promotion.value}€`
                              : promotion.type === "FREE_SHIPPING"
                                ? "Envío gratis"
                                : promotion.value}
                        </TableCell>
                        <TableCell>{formatDate(promotion.startDate)}</TableCell>
                        <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePromotionClick(promotion.id)
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
              <p className="text-muted-foreground mb-4">No se encontraron promociones</p>
              <Button onClick={() => router.push("/dashboard/promociones/asistente")}>
                <Plus className="mr-2 h-4 w-4" /> Crear nueva promoción
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
