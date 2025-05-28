"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface HealthCheck {
  status: "healthy" | "unhealthy" | "error"
  checks: {
    database: boolean
    shopify: boolean
    auth: boolean
    timestamp: string
  }
  message: string
}

export default function SystemHealthCheck() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health/check")
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error("Error checking health:", error)
      setHealth({
        status: "error",
        checks: {
          database: false,
          shopify: false,
          auth: false,
          timestamp: new Date().toISOString(),
        },
        message: "Error al verificar el estado del sistema",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-500">
            Saludable
          </Badge>
        )
      case "unhealthy":
        return <Badge variant="destructive">Problemas</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Verificación de componentes críticos</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {health ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado General:</span>
              {getStatusBadge(health.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Base de Datos:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.database)}
                  <span className="text-sm">{health.checks.database ? "Conectada" : "Error"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Shopify:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.shopify)}
                  <span className="text-sm">{health.checks.shopify ? "Configurado" : "Pendiente"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Autenticación:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.checks.auth)}
                  <span className="text-sm">{health.checks.auth ? "Configurada" : "Error"}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Última verificación: {new Date(health.checks.timestamp).toLocaleString()}
            </div>

            <div className="text-sm text-muted-foreground">{health.message}</div>
          </>
        ) : (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando estado del sistema...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
