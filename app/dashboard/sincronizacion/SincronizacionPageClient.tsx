"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { useState } from "react"

export default function SincronizacionPageClient() {
  const [productosProgress, setProductosProgress] = useState(0)
  const [coleccionesProgress, setColeccionesProgress] = useState(0)
  const [clientesProgress, setClientesProgress] = useState(0)
  const [pedidosProgress, setPedidosProgress] = useState(0)

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
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Productos</CardTitle>
              <CardDescription>Sincroniza tus productos con Shopify.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={productosProgress} />
              <div className="flex justify-between mt-2">
                <Button onClick={() => setProductosProgress(productosProgress + 10)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Productos
                </Button>
                <Badge variant="outline">{productosProgress}%</Badge>
              </div>
              {productosProgress === 100 && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Sincronización de productos completada.</AlertDescription>
                </Alert>
              )}
              {productosProgress > 100 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error en la sincronización de productos.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colecciones">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Colecciones</CardTitle>
              <CardDescription>Sincroniza tus colecciones con Shopify.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={coleccionesProgress} />
              <div className="flex justify-between mt-2">
                <Button onClick={() => setColeccionesProgress(coleccionesProgress + 10)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Colecciones
                </Button>
                <Badge variant="outline">{coleccionesProgress}%</Badge>
              </div>
              {coleccionesProgress === 100 && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Sincronización de colecciones completada.</AlertDescription>
                </Alert>
              )}
              {coleccionesProgress > 100 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error en la sincronización de colecciones.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Clientes</CardTitle>
              <CardDescription>Sincroniza tus clientes con Shopify.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={clientesProgress} />
              <div className="flex justify-between mt-2">
                <Button onClick={() => setClientesProgress(clientesProgress + 10)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Clientes
                </Button>
                <Badge variant="outline">{clientesProgress}%</Badge>
              </div>
              {clientesProgress === 100 && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Sincronización de clientes completada.</AlertDescription>
                </Alert>
              )}
              {clientesProgress > 100 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error en la sincronización de clientes.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Pedidos</CardTitle>
              <CardDescription>Sincroniza tus pedidos con Shopify.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={pedidosProgress} />
              <div className="flex justify-between mt-2">
                <Button onClick={() => setPedidosProgress(pedidosProgress + 10)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Pedidos
                </Button>
                <Badge variant="outline">{pedidosProgress}%</Badge>
              </div>
              {pedidosProgress === 100 && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Sincronización de pedidos completada.</AlertDescription>
                </Alert>
              )}
              {pedidosProgress > 100 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Error en la sincronización de pedidos.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registro">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Sincronización</CardTitle>
              <CardDescription>Historial de sincronizaciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Aquí se mostrará el registro de sincronizaciones.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
