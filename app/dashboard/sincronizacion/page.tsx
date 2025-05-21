import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SincronizacionIndividual } from "@/components/sincronizacion-individual"

export default function SincronizacionPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Sincronización con Shopify</h1>

      <p className="text-muted-foreground mb-6">
        Esta página te permite sincronizar datos entre tu tienda Shopify y la base de datos local. Selecciona el tipo de
        datos que deseas sincronizar y haz clic en el botón correspondiente.
      </p>

      <Tabs defaultValue="productos" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="colecciones">Colecciones</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="productos">
          <SincronizacionIndividual
            tipo="productos"
            titulo="Sincronización de Productos"
            descripcion="Sincroniza productos individuales desde Shopify a la base de datos local."
          />
        </TabsContent>

        <TabsContent value="colecciones">
          <SincronizacionIndividual
            tipo="colecciones"
            titulo="Sincronización de Colecciones"
            descripcion="Sincroniza colecciones individuales desde Shopify a la base de datos local."
          />
        </TabsContent>

        <TabsContent value="clientes">
          <SincronizacionIndividual
            tipo="clientes"
            titulo="Sincronización de Clientes"
            descripcion="Sincroniza clientes individuales desde Shopify a la base de datos local."
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <SincronizacionIndividual
            tipo="pedidos"
            titulo="Sincronización de Pedidos"
            descripcion="Sincroniza pedidos individuales desde Shopify a la base de datos local."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
