import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { DashboardStats } from "@/components/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"
// Importar el componente InitStatus
import { InitStatus } from "@/components/init-status"
import { Button } from "@/components/ui/button"
import Link from "next/link"
// Eliminar importaciones de componentes de tutoriales
// import { SincronizacionTutoriales } from "@/components/sincronizacion-tutoriales"
// import { SubirTutorialesShopify } from "@/components/subir-tutoriales-shopify"

export const dynamic = "force-dynamic"
export const revalidate = 0

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="mt-1 h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
        </div>
        <InitStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
            <CardDescription>Los últimos pedidos realizados en tu tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              }
            >
              <RecentOrders />
            </Suspense>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/orders">Ver todos los pedidos</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Productos recientes</CardTitle>
            <CardDescription>Los últimos productos añadidos a tu catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              }
            >
              <RecentProducts />
            </Suspense>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/products">Ver todos los productos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Eliminar la sección de tutoriales */}
      {/* <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tutoriales</CardTitle>
            <CardDescription>Gestiona los tutoriales de tu tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SincronizacionTutoriales />
              <SubirTutorialesShopify />
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
