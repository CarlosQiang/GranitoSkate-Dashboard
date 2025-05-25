"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle, Clock, Activity } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RegistroActividad {
  id: number
  usuario_nombre: string
  admin_nombre_completo: string
  accion: string
  entidad: string
  descripcion: string
  resultado: "SUCCESS" | "ERROR" | "WARNING"
  fecha_creacion: string
}

export default function RegistrosRecientes() {
  const [registros, setRegistros] = useState<RegistroActividad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarRegistros = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/registros?limite=10")
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
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarRegistros, 30000)
    return () => clearInterval(interval)
  }, [])

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
        return <CheckCircle className="h-3 w-3" />
      case "ERROR":
        return <AlertCircle className="h-3 w-3" />
      case "WARNING":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Últimos 10 movimientos del sistema</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={cargarRegistros} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={cargarRegistros} size="sm" className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registros.map((registro) => (
              <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {registro.accion}
                    </Badge>
                    <Badge className={`text-xs ${getBadgeColor(registro.resultado)}`}>
                      <span className="flex items-center gap-1">
                        {getActionIcon(registro.resultado)}
                        {registro.resultado}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{registro.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {registro.admin_nombre_completo || registro.usuario_nombre || "Sistema"} •{" "}
                    {format(new Date(registro.fecha_creacion), "dd/MM HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
