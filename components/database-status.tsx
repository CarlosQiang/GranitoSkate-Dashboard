"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TableStatus {
  exists: boolean
  count: number
  error: string | null
  details?: any[]
}

interface DatabaseStatusProps {
  onRefresh?: () => void
}

export function DatabaseStatus({ onRefresh }: DatabaseStatusProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [tablesStatus, setTablesStatus] = useState<Record<string, TableStatus>>({})
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const loadStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/db/status")

      if (response.ok) {
        const data = await response.json()
        setTablesStatus(data.tablesStatus)
        setLastUpdate(data.timestamp)
      }
    } catch (error) {
      console.error("Error loading database status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleRefresh = () => {
    loadStatus()
    onRefresh?.()
  }

  const getStatusIcon = (status: TableStatus) => {
    if (!status.exists) return <XCircle className="h-4 w-4 text-red-500" />
    if (status.count === 0) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusBadge = (status: TableStatus) => {
    if (!status.exists) return <Badge variant="destructive">No existe</Badge>
    if (status.count === 0) return <Badge variant="secondary">Vacía</Badge>
    return <Badge variant="default">{status.count} registros</Badge>
  }

  const tableLabels = {
    productos: "Productos",
    pedidos: "Pedidos",
    clientes: "Clientes",
    colecciones: "Colecciones",
    promociones: "Promociones",
    theme_configs: "Configuración de Tema",
    theme_settings: "Configuraciones de Tema",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de la Base de Datos
            </CardTitle>
            <CardDescription>
              Estado actual de las tablas y datos sincronizados
              {lastUpdate && (
                <span className="block text-xs mt-1">
                  Última actualización: {new Date(lastUpdate).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(tablesStatus).map(([tableName, status]) => (
            <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(status)}
                <div>
                  <p className="font-medium">{tableLabels[tableName] || tableName}</p>
                  {status.error && <p className="text-xs text-red-500">{status.error}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">{getStatusBadge(status)}</div>
            </div>
          ))}
        </div>

        {Object.keys(tablesStatus).length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">No se pudo cargar el estado de las tablas</div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Cargando estado de las tablas...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
