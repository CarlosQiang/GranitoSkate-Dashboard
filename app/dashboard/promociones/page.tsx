"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShopifyApiStatus } from "@/components/shopify-api-status"
import { fetchPromotions } from "@/lib/api/promotions"
import { formatDate } from "@/lib/utils"
import { Search, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PromocionesPage() {
  const router = useRouter()
  const [promotions, setPromotions] = useState([])
  const [filteredPromotions, setFilteredPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadPromotions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPromotions()
      setPromotions(data)
      setFilteredPromotions(data)
    } catch (err) {
      console.error("Error al cargar promociones:", err)
      setError(err.message || "Error al cargar promociones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  useEffect(() => {
    let filtered = [...promotions]

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (promo) =>
          promo.title.toLowerCase().includes(term) ||
          (promo.code && promo.code.toLowerCase().includes(term)) ||
          (promo.summary && promo.summary.toLowerCase().includes(term)),
      )
    }

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((promo) => promo.status === statusFilter)
    }

    setFilteredPromotions(filtered)
  }, [searchTerm, statusFilter, promotions])

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Activa</Badge>
      case "SCHEDULED":
        return <Badge variant="warning">Programada</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">Expirada</Badge>
      case "INACTIVE":
        return <Badge variant="outline">Inactiva</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "PERCENTAGE_DISCOUNT":
        return "Descuento porcentual"
      case "FIXED_AMOUNT_DISCOUNT":
        return "Descuento fijo"
      case "BUY_X_GET_Y":
        return "Compra X, lleva Y"
      case "FREE_SHIPPING":
        return "Envío gratis"
      default:
        return type
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
            <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">
              <Plus className="mr-2 h-4 w-4" />
              Nueva promoción
            </Link>
          </Button>
        </div>

        <ShopifyApiStatus />

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar promociones</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadPromotions} className="w-fit">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promociones/asistente">
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Link>
        </Button>
      </div>

      <ShopifyApiStatus />

      <Card>
        <CardHeader>
          <CardTitle>Todas las promociones</CardTitle>
          <CardDescription>
            {filteredPromotions.length > 0
              ? `Mostrando ${filteredPromotions.length} de ${promotions.length} promociones`
              : "No se encontraron promociones"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
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
                  <SelectItem value="ACTIVE">Activas</SelectItem>
                  <SelectItem value="SCHEDULED">Programadas</SelectItem>
                  <SelectItem value="EXPIRED">Expiradas</SelectItem>
                  <SelectItem value="INACTIVE">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPromotions.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Fecha fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow
                      key={promotion.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/promociones/${promotion.id}`)}
                    >
                      <TableCell className="font-medium">{promotion.title}</TableCell>
                      <TableCell>{getTypeLabel(promotion.type)}</TableCell>
                      <TableCell>
                        {promotion.code ? (
                          <Badge variant="outline">{promotion.code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                      <TableCell>
                        {promotion.endDate ? (
                          formatDate(promotion.endDate)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/promociones/${promotion.id}`)
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
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron promociones</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
