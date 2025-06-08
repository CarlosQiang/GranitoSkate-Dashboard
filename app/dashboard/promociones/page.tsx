import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { PromocionesListClient } from "@/components/promociones-list-client"

export default function PromocionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promociones/asistente">
            <Plus className="mr-2 h-4 w-4" />
            Nueva promoción
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="expiradas">Expiradas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Suspense fallback={<PromocionesLoadingSkeleton />}>
            <PromocionesListClient filter="todas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="activas" className="space-y-4">
          <Suspense fallback={<PromocionesLoadingSkeleton />}>
            <PromocionesListClient filter="activas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="programadas" className="space-y-4">
          <Suspense fallback={<PromocionesLoadingSkeleton />}>
            <PromocionesListClient filter="programadas" />
          </Suspense>
        </TabsContent>

        <TabsContent value="expiradas" className="space-y-4">
          <Suspense fallback={<PromocionesLoadingSkeleton />}>
            <PromocionesListClient filter="expiradas" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PromocionesLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
