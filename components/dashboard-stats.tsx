"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, ShoppingCart, Package, Users, Tag, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardStats() {
  const [stats, setStats] = useState({
    productos: 0,
    colecciones: 0,
    clientes: 0,
    pedidos: 0,
    promociones: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbConnectionError, setDbConnectionError] = useState<boolean>(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    setDbConnectionError(false)

    try {
      // Verificar la conexión a la base de datos antes de obtener estadísticas
      const connectionCheck = await fetch("/api/db/check-connection")
      if (!connectionCheck.ok) {
        setDbConnectionError(true)
        const errorData = await connectionCheck.json()
        throw new Error(`Error de conexión a la base de datos: ${errorData.message || "Error desconocido"}`)
      }

      // Obtener estadísticas de la base de datos
      const [productosRes, coleccionesRes, clientesRes, pedidosRes, promocionesRes] = await Promise.all([
        fetch("/api/db/productos/count"),
        fetch("/api/db/colecciones/count"),
        fetch("/api/db/clientes/count"),
        fetch("/api/db/pedidos/count"),
        fetch("/api/db/promociones/count"),
      ])

      if (!productosRes.ok || !coleccionesRes.ok || !clientesRes.ok || !pedidosRes.ok || !promocionesRes.ok) {
        throw new Error("Error al obtener estadísticas")
      }

      const productos = await productosRes.json()
      const colecciones = await coleccionesRes.json()
      const clientes = await clientesRes.json()
      const pedidos = await pedidosRes.json()
      const promociones = await promocionesRes.json()

      setStats({
        productos: productos.count,
        colecciones: colecciones.count,
        clientes: clientes.count,
        pedidos: pedidos.count,
        promociones: promociones.count,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas</h2>
        <button
          onClick={fetchStats}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {dbConnectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión a la base de datos</AlertTitle>
          <AlertDescription>
            No se pudo conectar a la base de datos. Por favor, verifica la configuración de la conexión.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.productos}</div>
            <p className="text-xs text-muted-foreground">Productos en catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colecciones</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.colecciones}</div>
            <p className="text-xs text-muted-foreground">Colecciones activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.clientes}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pedidos}</div>
            <p className="text-xs text-muted-foreground">Pedidos totales</p>
          </CardContent>
        </Card>
      </div>

      {error && !dbConnectionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Error al cargar estadísticas: {error}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resumen de Ventas</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de ventas (próximamente)
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Tendencias de Ventas</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de tendencias (próximamente)
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <PopularProducts />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/db/registro?limit=5")
        if (response.ok) {
          const data = await response.json()
          setActivities(data.registros || [])
        } else {
          throw new Error("Error al obtener actividades recientes")
        }
      } catch (error) {
        console.error("Error al cargar actividades recientes:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Cargando actividades...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
        Error: {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No hay actividades recientes</div>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <div key={activity.id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.tipo}</p>
            <p className="text-sm text-muted-foreground">
              {activity.mensaje.length > 50 ? `${activity.mensaje.substring(0, 50)}...` : activity.mensaje}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(activity.fecha).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PopularProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/db/productos?limit=5&sort=inventario")
        if (response.ok) {
          const data = await response.json()
          setProducts(data.productos || [])
        } else {
          throw new Error("Error al obtener productos populares")
        }
      } catch (error) {
        console.error("Error al cargar productos populares:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Cargando productos...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <AlertCircle className="h-4 w-4 mx-auto mb-2" />
        Error: {error}
      </div>
    )
  }

  if (products.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No hay productos disponibles</div>
  }

  return (
    <div className="space-y-4">
      {products.map((product: any) => (
        <div key={product.id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{product.nombre}</p>
            <p className="text-sm text-muted-foreground">
              Inventario: {product.inventario} | Precio: ${product.precio}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
