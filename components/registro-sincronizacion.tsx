"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type RegistroSincronizacion = {
  id: number
  tipo: string
  estado: string
  mensaje: string
  fecha: string
  fecha_actualizacion: string | null
  duracion_ms: number | null
}

type PaginationInfo = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function RegistroSincronizacion() {
  const [registros, setRegistros] = useState<RegistroSincronizacion[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("")

  useEffect(() => {
    fetchRegistros()
  }, [pagination.page, filtroEstado])

  const fetchRegistros = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filtroEstado) {
        params.append("estado", filtroEstado)
      }

      const response = await fetch(`/api/db/registro?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Error al obtener los registros de sincronización")
      }

      const data = await response.json()
      setRegistros(data.registros)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error al cargar registros:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Completado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )
      case "inicio":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" /> Iniciado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A"

    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds} seg`

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes} min ${remainingSeconds} seg`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Registro de Sincronización</CardTitle>
            <CardDescription>Historial de sincronizaciones con Shopify</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="inicio">Iniciado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => fetchRegistros()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            {error}
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">No hay registros de sincronización disponibles.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium">{registro.id}</TableCell>
                    <TableCell>{registro.tipo}</TableCell>
                    <TableCell>{getEstadoBadge(registro.estado)}</TableCell>
                    <TableCell>{format(new Date(registro.fecha), "dd/MM/yyyy HH:mm:ss", { locale: es })}</TableCell>
                    <TableCell>{formatDuration(registro.duracion_ms)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={registro.mensaje}>
                      {registro.mensaje}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-center space-x-2 mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  />

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) => page === 1 || page === pagination.totalPages || Math.abs(page - pagination.page) <= 1,
                    )
                    .map((page, index, array) => {
                      // Agregar puntos suspensivos si hay saltos en la numeración
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <PaginationItem>
                              <span className="px-2">...</span>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === pagination.page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        )
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink onClick={() => handlePageChange(page)} isActive={page === pagination.page}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
