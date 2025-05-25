"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, RefreshCw, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RegistroActividad {
  id: string
  usuario_nombre: string
  accion: string
  entidad: string
  descripcion: string
  resultado: "SUCCESS" | "ERROR" | "WARNING"
  fecha_creacion: string
}

export default function RegistrosRecientes() {
  const [registros, setRegistros] = useState<RegistroActividad[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const cargarRegistros = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/registros?limite=5")
      if (response.ok) {
        const data = await response.json()
        setRegistros(data)
      }
    } catch (error) {
      console.error("Error al cargar registros:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarRegistros()
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
        return <AlertTriangle className="h-3 w-3" />
      case "WARNING":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>Últimos 5 movimientos del sistema</CardDescription>
        <Button onClick={cargarRegistros} variant="outline" size="sm" className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Cargando registros...</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registros.map((registro) => (
              <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {registro.accion}
                    </Badge>
                    <Badge className={getBadgeColor(registro.resultado)}>
                      <span className="flex items-center gap-1">
                        {getActionIcon(registro.resultado)}
                        {registro.resultado}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{registro.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {registro.usuario_nombre} •{" "}
                    {format(new Date(registro.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
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
