import type { Metadata } from "next"
import SincronizacionProductos from "@/components/sincronizacion-productos"
import SincronizacionColecciones from "@/components/sincronizacion-colecciones"
import SincronizacionClientes from "@/components/sincronizacion-clientes"
import SincronizacionPedidos from "@/components/sincronizacion-pedidos"
import RegistroSincronizacion from "@/components/registro-sincronizacion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, FolderOpen, Users, ShoppingCart, ClipboardList } from "lucide-react"

export const metadata: Metadata = {
  title: "Sincronización con Shopify | GestionGranito",
  description: "Sincroniza tus productos, colecciones, clientes y pedidos con Shopify",
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
          <div className="grid gap-6">
            <SincronizacionProductos />
          </div>
        </TabsContent>

        <TabsContent value="colecciones">
          <div className="grid gap-6">
            <SincronizacionColecciones />
          </div>
        </TabsContent>

        <TabsContent value="clientes">
          <div className="grid gap-6">
            <SincronizacionClientes />
          </div>
        </TabsContent>

        <TabsContent value="pedidos">
          <div className="grid gap-6">
            <SincronizacionPedidos />
          </div>
        </TabsContent>

        <TabsContent value="registro">
          <div className="grid gap-6">
            <RegistroSincronizacion />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
