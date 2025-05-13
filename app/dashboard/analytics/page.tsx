"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart, ProductsChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchAnalyticsData } from "@/lib/api/analytics"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueData: [],
    ordersData: [],
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const analyticsData = await fetchAnalyticsData()
      setData(analyticsData)
    } catch (error) {
      console.error("Error loading analytics data:", error)
      setError(`Error al cargar datos de análisis: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Análisis</h2>
        {!isLoading && (
          <Button variant="outline" onClick={loadAnalyticsData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar datos
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error al cargar datos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue, "EUR")}</div>
                    {data.revenueData.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {data.revenueData[data.revenueData.length - 1].total >
                        data.revenueData[data.revenueData.length - 2].total
                          ? "+"
                          : "-"}
                        {Math.abs(
                          ((data.revenueData[data.revenueData.length - 1].total -
                            data.revenueData[data.revenueData.length - 2].total) /
                            data.revenueData[data.revenueData.length - 2].total) *
                            100,
                        ).toFixed(1)}
                        % respecto al mes anterior
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{data.totalOrders}</div>
                    {data.ordersData.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {data.ordersData[data.ordersData.length - 1].total >
                        data.ordersData[data.ordersData.length - 2].total
                          ? "+"
                          : "-"}
                        {Math.abs(
                          ((data.ordersData[data.ordersData.length - 1].total -
                            data.ordersData[data.ordersData.length - 2].total) /
                            data.ordersData[data.ordersData.length - 2].total) *
                            100,
                        ).toFixed(1)}
                        % respecto al mes anterior
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio de Pedido</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(data.averageOrderValue, "EUR")}</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : data.revenueData.length > 0 ? (
                  <RevenueChart data={data.revenueData} />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No hay datos de ingresos disponibles
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Los productos más vendidos este mes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : data.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {data.topProducts.map((product: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="font-medium">{product.name}</div>
                        <div className="ml-auto font-medium">{product.sales} unidades</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">No hay datos de productos disponibles</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Mes</CardTitle>
              <CardDescription>Análisis detallado de ingresos mensuales</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : data.revenueData.length > 0 ? (
                <RevenueChart data={data.revenueData} />
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No hay datos de ingresos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventas de Productos</CardTitle>
              <CardDescription>Análisis detallado de ventas por producto</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : data.topProducts.length > 0 ? (
                <ProductsChart data={data.topProducts} />
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No hay datos de productos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
