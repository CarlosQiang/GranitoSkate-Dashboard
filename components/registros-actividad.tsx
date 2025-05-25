"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RegistroActividad {
  id: number
  usuario_nombre: string
  admin_nombre_completo: string
  accion: string
  entidad: string
  entidad_id: string
  descripcion: string
  resultado: "SUCCESS" | "ERROR" | "WARNING"
  duracion_ms: number
  fecha_creacion: string
  ip_address: string
}

export default function RegistrosActividad() {
  const [registros, setRegistros] = useState<RegistroActividad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [accionFiltro, setAccionFiltro] = useState("all")
  const [entidadFiltro, setEntidadFiltro] = useState("all")
  const [resultadoFiltro, setResultadoFiltro] = useState("all")
  const [limite, setLimite] = useState(50)

  const cargarRegistros = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limite: limite.toString(),
        offset: "0",
      })

      if (accionFiltro !== "all") params.append("accion", accionFiltro)
      if (entidadFiltro !== "all") params.append("entidad", entidadFiltro)
      if (resultadoFiltro !== "all") params.append("resultado", resultadoFiltro)

      const response = await fetch(`/api/registros?${params}`)
      if (!response.ok) {
        throw new Error(`Error al cargar registros: ${response.statusText}`)
      }

      const data = await response.json()
      setRegistros(data)
    } catch (err) {
      console.error("Error al cargar registros:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarRegistros()
  }, [accionFiltro, entidadFiltro, resultadoFiltro, limite])

  const getBadgeColor = (resultado: string) => {
    switch (resultado) {
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

  const getActionIcon = (resultado: string) => {
    switch (resultado) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4" />
      case "ERROR":
        return <AlertCircle className="h-4 w-4" />
      case "WARNING":
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Registros de Actividad</CardTitle>
        <CardDescription>Historial completo de todas las acciones realizadas en el sistema</CardDescription>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Select value={accionFiltro} onValueChange={setAccionFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="API_REQUEST">Petición API</SelectItem>
                <SelectItem value="SYSTEM_ERROR">Error del Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={entidadFiltro} onValueChange={setEntidadFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="SYSTEM">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={resultadoFiltro} onValueChange={setResultadoFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los resultados</SelectItem>
                <SelectItem value="SUCCESS">Exitoso</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARNING">Advertencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button onClick={cargarRegistros} className="w-full sm:w-auto">
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
            <h3 className="text-lg font-medium">Error al cargar registros</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={cargarRegistros} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay registros</h3>
            <p className="text-sm text-muted-foreground mt-2">No se encontraron registros con los filtros actuales</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(registro.fecha_creacion), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                    </TableCell>
                    <TableCell>{registro.admin_nombre_completo || registro.usuario_nombre || "Sistema"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{registro.accion}</Badge>
                    </TableCell>
                    <TableCell>{registro.entidad || "-"}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{registro.descripcion || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(registro.resultado)}>
                        <span className="flex items-center gap-1">
                          {getActionIcon(registro.resultado)}
                          {registro.resultado}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>{registro.duracion_ms ? `${registro.duracion_ms}ms` : "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{registro.ip_address || "-"}</TableCell>
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
