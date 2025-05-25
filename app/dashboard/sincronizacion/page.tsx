"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import {
  Package,
  FolderOpen,
  Users,
  ShoppingCart,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

// Componente de sincronización de productos
function SincronizacionProductos() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setStatus("syncing")
    setProgress(0)

    try {
      const response = await fetch("/api/sync/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Error en la sincronización")

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setStatus("success")
      toast({
        title: "Sincronización completada",
        description: "Los productos se han sincronizado correctamente",
      })
    } catch (error) {
      setStatus("error")
      toast({
        title: "Error",
        description: "Error en la sincronización de productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sincronización de Productos
        </CardTitle>
        <CardDescription>Sincroniza los productos entre Shopify y la base de datos local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sincronizando productos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Sincronización completada exitosamente</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error en la sincronización</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Productos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente de sincronización de colecciones
function SincronizacionColecciones() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setStatus("syncing")
    setProgress(0)

    try {
      const response = await fetch("/api/sync/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Error en la sincronización")

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setStatus("success")
      toast({
        title: "Sincronización completada",
        description: "Las colecciones se han sincronizado correctamente",
      })
    } catch (error) {
      setStatus("error")
      toast({
        title: "Error",
        description: "Error en la sincronización de colecciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Sincronización de Colecciones
        </CardTitle>
        <CardDescription>Sincroniza las colecciones entre Shopify y la base de datos local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sincronizando colecciones...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Sincronización completada exitosamente</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error en la sincronización</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Colecciones
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente de sincronización de clientes
function SincronizacionClientes() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setStatus("syncing")
    setProgress(0)

    try {
      const response = await fetch("/api/sync/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Error en la sincronización")

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setStatus("success")
      toast({
        title: "Sincronización completada",
        description: "Los clientes se han sincronizado correctamente",
      })
    } catch (error) {
      setStatus("error")
      toast({
        title: "Error",
        description: "Error en la sincronización de clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sincronización de Clientes
        </CardTitle>
        <CardDescription>Sincroniza los clientes entre Shopify y la base de datos local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sincronizando clientes...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Sincronización completada exitosamente</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error en la sincronización</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Clientes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente de sincronización de pedidos
function SincronizacionPedidos() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleSync = async () => {
    setIsLoading(true)
    setStatus("syncing")
    setProgress(0)

    try {
      const response = await fetch("/api/sync/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Error en la sincronización")

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setStatus("success")
      toast({
        title: "Sincronización completada",
        description: "Los pedidos se han sincronizado correctamente",
      })
    } catch (error) {
      setStatus("error")
      toast({
        title: "Error",
        description: "Error en la sincronización de pedidos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Sincronización de Pedidos
        </CardTitle>
        <CardDescription>Sincroniza los pedidos entre Shopify y la base de datos local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sincronizando pedidos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Sincronización completada exitosamente</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error en la sincronización</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Pedidos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Componente de registro de sincronización
function RegistroSincronizacion() {
  const [registros] = useState([
    {
      id: 1,
      tipo: "Productos",
      fecha: new Date().toISOString(),
      estado: "success",
      mensaje: "Sincronización completada: 25 productos",
    },
    {
      id: 2,
      tipo: "Colecciones",
      fecha: new Date(Date.now() - 3600000).toISOString(),
      estado: "success",
      mensaje: "Sincronización completada: 8 colecciones",
    },
    {
      id: 3,
      tipo: "Clientes",
      fecha: new Date(Date.now() - 7200000).toISOString(),
      estado: "error",
      mensaje: "Error: Token de acceso inválido",
    },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Registro de Sincronización
        </CardTitle>
        <CardDescription>Historial de sincronizaciones realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registros.map((registro) => (
            <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={registro.estado === "success" ? "default" : "destructive"}>
                  {registro.estado === "success" ? "Éxito" : "Error"}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{registro.tipo}</p>
                  <p className="text-xs text-muted-foreground">{registro.mensaje}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(registro.fecha).toLocaleString("es-ES")}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SincronizacionPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sincronización con Shopify</h1>
        <p className="text-muted-foreground mt-2">Sincroniza tus datos entre Shopify y GestionGranito</p>
      </div>

      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="productos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="colecciones" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Colecciones
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="registro" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Registro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos">
          <SincronizacionProductos />
        </TabsContent>

        <TabsContent value="colecciones">
          <SincronizacionColecciones />
        </TabsContent>

        <TabsContent value="clientes">
          <SincronizacionClientes />
        </TabsContent>

        <TabsContent value="pedidos">
          <SincronizacionPedidos />
        </TabsContent>

        <TabsContent value="registro">
          <RegistroSincronizacion />
        </TabsContent>
      </Tabs>
    </div>
  )
}
