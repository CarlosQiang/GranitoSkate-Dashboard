import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromocionesListWrapper } from "@/components/promociones-list-wrapper"
import { SyncPromotionsOnly } from "@/components/sincronizacion-promociones"

export const dynamic = "force-dynamic"
export const revalidate = 60

export default function PromocionesPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/promociones/asistente">
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-4">
          <Suspense fallback={<div className="flex justify-center items-center h-40">Cargando promociones...</div>}>
            <PromocionesListWrapper filter="todas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="activas" className="mt-4">
          <Suspense
            fallback={<div className="flex justify-center items-center h-40">Cargando promociones activas...</div>}
          >
            <PromocionesListWrapper filter="activas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="programadas" className="mt-4">
          <Suspense
            fallback={<div className="flex justify-center items-center h-40">Cargando promociones programadas...</div>}
          >
            <PromocionesListWrapper filter="programadas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="expiradas" className="mt-4">
          <Suspense
            fallback={<div className="flex justify-center items-center h-40">Cargando promociones expiradas...</div>}
          >
            <PromocionesListWrapper filter="expiradas" />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Componente de sincronización */}
      <div className="mt-8">
        <SyncPromotionsOnly />
      </div>
    </div>
  )
}
