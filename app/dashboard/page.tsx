import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, BarChart } from "lucide-react"
import CacheStatus from "@/components/cache-status"
import ProductsList from "@/components/products-list"
import { DashboardStats } from "@/components/dashboard-stats"

export const metadata: Metadata = {
  title: "Dashboard | GestionGranito",
  description: "Panel de control para gestionar tu tienda Shopify",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido a GestionGranito</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Estado de caché
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <ProductsList />
        </TabsContent>
        <TabsContent value="cache" className="space-y-4">
          <CacheStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
