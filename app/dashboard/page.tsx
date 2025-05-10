import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/lib/api/products"
import { getOrders } from "@/lib/api/orders"
import { getCustomers } from "@/lib/api/customers"
import { formatShopifyPrice } from "@/lib/shopify"
import { formatDate } from "@/lib/utils"
import { ShoppingBag, Users, CreditCard, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

// Componente para cargar las estadísticas
async function DashboardStats() {
  const { products } = await getProducts(1)
  const { orders } = await getOrders(10)
  const { customers } = await getCustomers(1)

  // Calcular el total de ventas
  const totalSales = orders.reduce((total, order) => total + Number.parseFloat(order.totalPriceSet.shopMoney.amount), 0)

  // Obtener el número de productos
  const productsCount = products.length > 0 ? products[0].id.split("/").pop() : 0

  // Obtener el número de clientes
  const customersCount = customers.length > 0 ? customers[0].id.split("/").pop() : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatShopifyPrice(totalSales)}</div>
          <p className="text-xs text-muted-foreground">De los últimos 10 pedidos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
          <p className="text-xs text-muted-foreground">Últimos pedidos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Productos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productsCount}</div>
          <p className="text-xs text-muted-foreground">Total de productos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customersCount}</div>
          <p className="text-xs text-muted-foreground">Total de clientes</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para cargar los pedidos recientes
async function RecentOrders() {
  const { orders } = await getOrders(5)

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
              <div>
                <div className="font-medium">{order.name}</div>
                <div className="text-sm text-gray-500">
                  {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Cliente no registrado"}
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.displayFinancialStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : order.displayFinancialStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.displayFinancialStatus}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col sm:flex-row justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Fecha</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex flex-col mt-2 sm:mt-0">
                <span className="text-sm text-gray-500">Productos</span>
                <span>{order.lineItems.edges.length} productos</span>
              </div>
              <div className="flex flex-col mt-2 sm:mt-0">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-medium">{formatShopifyPrice(order.totalPriceSet.shopMoney.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">
            Ver todos los pedidos
            <Eye className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Componente para cargar los productos recientes
async function RecentProducts() {
  const { products } = await getProducts(5)

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="flex-shrink-0 mr-4">
                {product.images.edges.length > 0 ? (
                  <img
                    src={product.images.edges[0].node.url || "/placeholder.svg"}
                    alt={product.images.edges[0].node.altText || product.title}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{product.title}</div>
                <div className="text-sm text-gray-500 truncate">{product.description}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">{formatShopifyPrice(product.priceRange.minVariantPrice.amount)}</div>
                <div className="text-sm text-gray-500">
                  {product.totalInventory > 0 ? `${product.totalInventory} en stock` : "Sin stock"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/dashboard/products">
            Ver todos los productos
            <Eye className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Componentes de carga
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function OrdersLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16 mt-2 sm:mt-0 rounded-full" />
            </div>
            <div className="p-4 flex flex-col sm:flex-row justify-between">
              <div className="flex flex-col">
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col mt-2 sm:mt-0">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-col mt-2 sm:mt-0">
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <Skeleton className="h-10 w-10 rounded-md mr-4" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <Suspense fallback={<StatsLoading />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<OrdersLoading />}>
              <RecentOrders />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Recientes</CardTitle>
            <CardDescription>Últimos productos añadidos</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ProductsLoading />}>
              <RecentProducts />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
