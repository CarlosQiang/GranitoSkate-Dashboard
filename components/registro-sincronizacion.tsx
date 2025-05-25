"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, ClipboardList } from "lucide-react"

export default function RegistroSincronizacion() {
  const [registros, setRegistros] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const cargarRegistros = async () => {
    setIsLoading(true)
    try {
      // Simular carga de registros
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockRegistros = [
        {
          id: 1,
          tipo: "PRODUCTOS",
          estado: "COMPLETADO",
          fecha: new Date().toISOString(),
          elementos: 25,
          errores: 0,
        },
        {
          id: 2,
          tipo: "COLECCIONES",
          estado: "COMPLETADO",
          fecha: new Date(Date.now() - 3600000).toISOString(),
          elementos: 8,
          errores: 0,
        },
        {
          id: 3,
          tipo: "CLIENTES",
          estado: "ERROR",
          fecha: new Date(Date.now() - 7200000).toISOString(),
          elementos: 0,
          errores: 1,
        },
      ]

      setRegistros(mockRegistros)
    } catch (error) {
      console.error("Error al cargar registros:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarRegistros()
  }, [])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "COMPLETADO":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "ERROR":
        return <Badge variant="destructive">Error</Badge>
      case "EN_PROGRESO":
        return <Badge className="bg-yellow-100 text-yellow-800">En progreso</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Registro de Sincronizaciones
        </CardTitle>
        <CardDescription>Historial de todas las sincronizaciones realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Últimas sincronizaciones realizadas</span>
          <Button variant="outline" size="sm" onClick={cargarRegistros} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Elementos</TableHead>
              <TableHead>Errores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {isLoading ? "Cargando registros..." : "No hay registros de sincronización"}
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro) => (
                <TableRow key={registro.id}>
                  <TableCell className="font-medium">{registro.tipo}</TableCell>
                  <TableCell>{getEstadoBadge(registro.estado)}</TableCell>
                  <TableCell>{new Date(registro.fecha).toLocaleString("es-ES")}</TableCell>
                  <TableCell>{registro.elementos}</TableCell>
                  <TableCell>{registro.errores}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
