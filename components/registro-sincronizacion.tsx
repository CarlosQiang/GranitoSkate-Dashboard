"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RefreshCw, Filter, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function RegistroSincronizacion() {
  const [eventos, setEventos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [entidadFiltro, setEntidadFiltro] = useState("")
  const [limite, setLimite] = useState(50)

  const cargarEventos = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let url = `/api/db/registro?limit=${limite}`
      if (tipoFiltro) {
        url += `&tipo=${tipoFiltro}`
      }
      if (entidadFiltro) {
        url += `&entidad=${entidadFiltro}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error al cargar eventos: ${response.statusText}`)
      }

      const data = await response.json()
      setEventos(data)
    } catch (err) {
      console.error("Error al cargar eventos:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarEventos()
  }, [tipoFiltro, entidadFiltro, limite])

  const getBadgeColor = (resultado) => {
    switch (resultado.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800"
      case "ERROR":
        return "bg-red-100 text-red-800"
      case "WARNING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionColor = (accion) => {
    switch (accion.toUpperCase()) {
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
        return "bg-purple-100 text-purple-800"
      case "DELETE":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Registro de Sincronización</CardTitle>
        <CardDescription>
          Historial de operaciones de sincronización entre la aplicación y la base de datos
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value="PRODUCT">Productos</SelectItem>
                <SelectItem value="COLLECTION">Colecciones</SelectItem>
                <SelectItem value="PROMOTION">Promociones</SelectItem>
                <SelectItem value="TUTORIAL">Tutoriales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="ID de entidad"
                value={entidadFiltro}
                onChange={(e) => setEntidadFiltro(e.target.value)}
              />
              <Button variant="outline" onClick={() => setEntidadFiltro("")}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
          <div>
            <Button onClick={cargarEventos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Error al cargar eventos</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={cargarEventos} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : eventos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay eventos registrados</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No se encontraron eventos de sincronización con los filtros actuales
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(evento.fecha), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                    </TableCell>
                    <TableCell>{evento.tipo_entidad}</TableCell>
                    <TableCell>{evento.entidad_id || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getActionColor(evento.accion)}>{evento.accion}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(evento.resultado)}>{evento.resultado}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{evento.mensaje || "-"}</TableCell>
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
