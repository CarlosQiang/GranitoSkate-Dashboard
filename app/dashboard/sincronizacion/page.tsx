import { SincronizacionProductos } from "@/components/sincronizacion-productos"
import { SincronizacionColecciones } from "@/components/sincronizacion-colecciones"
import { SincronizacionClientes } from "@/components/sincronizacion-clientes"
import { SincronizacionPedidos } from "@/components/sincronizacion-pedidos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SincronizacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sincronización con Shopify</h1>
        <p className="text-muted-foreground">
          Gestiona la sincronización de datos entre tu tienda Shopify y la base de datos local
        </p>
      </div>

      <Tabs defaultValue="productos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="colecciones">Colecciones</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4">
          <SincronizacionProductos />
        </TabsContent>

        <TabsContent value="colecciones" className="space-y-4">
          <SincronizacionColecciones />
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <SincronizacionClientes />
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-4">
          <SincronizacionPedidos />
        </TabsContent>
      </Tabs>
    </div>
  )
}
