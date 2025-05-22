import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SincronizacionProductos } from "@/components/sincronizacion-productos"
import { SincronizacionColecciones } from "@/components/sincronizacion-colecciones"
import { SincronizacionClientes } from "@/components/sincronizacion-clientes"
import { SincronizacionPedidos } from "@/components/sincronizacion-pedidos"
import { RegistroSincronizacion } from "@/components/registro-sincronizacion"

export default function SincronizacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sincronización con Shopify</h1>
        <p className="text-muted-foreground">
          Sincroniza tus productos, colecciones, clientes y pedidos con tu tienda Shopify
        </p>
      </div>

      <Tabs defaultValue="productos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="colecciones">Colecciones</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="registro">Registro</TabsTrigger>
        </TabsList>
        <TabsContent value="productos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Productos</CardTitle>
              <CardDescription>
                Sincroniza los productos de tu tienda Shopify con la base de datos local
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SincronizacionProductos />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="colecciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Colecciones</CardTitle>
              <CardDescription>
                Sincroniza las colecciones de tu tienda Shopify con la base de datos local
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SincronizacionColecciones />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Clientes</CardTitle>
              <CardDescription>Sincroniza los clientes de tu tienda Shopify con la base de datos local</CardDescription>
            </CardHeader>
            <CardContent>
              <SincronizacionClientes />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización de Pedidos</CardTitle>
              <CardDescription>Sincroniza los pedidos de tu tienda Shopify con la base de datos local</CardDescription>
            </CardHeader>
            <CardContent>
              <SincronizacionPedidos />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="registro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Sincronización</CardTitle>
              <CardDescription>Consulta el historial de sincronizaciones realizadas y sus resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistroSincronizacion />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
