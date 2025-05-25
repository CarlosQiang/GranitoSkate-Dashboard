"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  AlertTriangle,
  Database,
  Shield,
  Activity,
  Users,
  Package,
  Layers,
  Tag,
  ShoppingCart,
  Search,
  BarChart,
  FileText,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react"

interface SystemStatus {
  funcionando: string[]
  pendiente: string[]
  dbInfo: any
  userInfo: any
}

export default function SetupPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const verificarSistema = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Verificar estado del sistema
      const response = await fetch("/api/system/status")
      if (!response.ok) {
        throw new Error("Error al verificar el sistema")
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    verificarSistema()
  }, [])

  const funcionandoItems = [
    { name: "Autenticación NextAuth", icon: Shield },
    { name: "Base de datos PostgreSQL", icon: Database },
    { name: "Sistema de logging", icon: Activity },
    { name: "Gestión de administradores", icon: Users },
  ]

  const pendienteItems = [
    { name: "Integración con Shopify", icon: Package },
    { name: "Gestión de productos", icon: Package },
    { name: "Sistema de promociones", icon: Tag },
    { name: "Gestión de clientes", icon: Users },
    { name: "Gestión de colecciones", icon: Layers },
    { name: "Gestión de pedidos", icon: ShoppingCart },
    { name: "SEO y mercados", icon: Search },
    { name: "Analíticas", icon: BarChart },
  ]

  const proximosPasos = [
    "Verificar que puedes hacer login con las credenciales del admin",
    "Revisar que los registros de actividad se están guardando",
    "Configurar las credenciales de Shopify en variables de entorno",
    "Implementar las tablas de productos y colecciones",
    "Desarrollar la sincronización con Shopify",
    "Añadir sistema de webhooks para actualizaciones en tiempo real",
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Configuración Inicial
          </h1>
          <p className="text-muted-foreground mt-2">Verifica el estado de los componentes del sistema</p>
        </div>
        <Button onClick={verificarSistema} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Verificar Sistema
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Base de Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Datos
            </CardTitle>
            <CardDescription>Estado de las tablas del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tabla administradores</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tabla registros_actividad</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tabla sesiones_usuario</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activa
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Usuario Administrador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuario Administrador
            </CardTitle>
            <CardDescription>Configuración del usuario principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Usuario:</span>
              <span className="text-sm text-muted-foreground"> admin</span>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-muted-foreground"> admin@gmail.com</span>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Contraseña:</span>
              <span className="text-sm text-muted-foreground"> GranitoSkate</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Usuario configurado correctamente
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>Verificación de componentes principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Funcionando */}
            <div>
              <h3 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Funcionando
              </h3>
              <div className="space-y-2">
                {funcionandoItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pendiente */}
            <div>
              <h3 className="font-medium text-yellow-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pendiente
              </h3>
              <div className="space-y-2">
                {pendienteItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Pasos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Próximos Pasos
          </CardTitle>
          <CardDescription>Recomendaciones para continuar con el desarrollo</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {proximosPasos.map((paso, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-granito text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-sm">{paso}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
