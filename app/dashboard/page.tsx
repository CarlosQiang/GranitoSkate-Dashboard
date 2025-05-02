import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RecentProducts } from "@/components/recent-products"
import { ShopifyApiStatus } from "@/components/shopify-api-status"
import { DashboardErrorBoundary } from "@/components/dashboard-error-boundary"
import { ConditionalShopifyComponent } from "@/components/conditional-shopify-component"

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de GranitoSkate</p>
        </div>

        <ShopifyApiStatus />

        <ConditionalShopifyComponent>
          <DashboardStats />
        </ConditionalShopifyComponent>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Pedidos recientes</TabsTrigger>
            <TabsTrigger value="products">Productos recientes</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="space-y-4">
            <ConditionalShopifyComponent>
              <RecentOrders />
            </ConditionalShopifyComponent>
          </TabsContent>
          <TabsContent value="products" className="space-y-4">
            <ConditionalShopifyComponent>
              <RecentProducts />
            </ConditionalShopifyComponent>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardErrorBoundary>
  )
}
