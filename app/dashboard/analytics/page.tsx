"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart, ProductsChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueData: [],
    ordersData: [],
  })

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setData({
        totalRevenue: 15420.25,
        totalOrders: 356,
        averageOrderValue: 43.32,
        topProducts: [
          { name: "Zapatillas Skate Pro", sales: 124 },
          { name: "Tabla Element Classic", sales: 98 },
          { name: "Ruedas Spitfire 52mm", sales: 87 },
          { name: "Trucks Independent 149", sales: 65 },
          { name: "Rodamientos Bones Reds", sales: 59 },
        ],
        revenueData: [
          { name: "Ene", total: 1200 },
          { name: "Feb", total: 1800 },
          { name: "Mar", total: 2200 },
          { name: "Abr", total: 1800 },
          { name: "May", total: 2400 },
          { name: "Jun", total: 2800 },
          { name: "Jul", total: 3200 },
        ],
        ordersData: [
          { name: "Ene", total: 45 },
          { name: "Feb", total: 52 },
          { name: "Mar", total: 48 },
          { name: "Abr", total: 38 },
          { name: "May", total: 50 },
          { name: "Jun", total: 55 },
          { name: "Jul", total: 68 },
        ],
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Análisis</h2>
      </div>
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
                    <div className="text-2xl font-bold">
                      {data.totalRevenue.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </div>
                    <p className="text-xs text-muted-foreground">+20.1% respecto al mes anterior</p>
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
                    <p className="text-xs text-muted-foreground">+10.5% respecto al mes anterior</p>
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
                    <div className="text-2xl font-bold">
                      {data.averageOrderValue.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </div>
                    <p className="text-xs text-muted-foreground">+5.2% respecto al mes anterior</p>
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
                {isLoading ? <Skeleton className="h-[300px] w-full" /> : <RevenueChart data={data.revenueData} />}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Los 5 productos más vendidos este mes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="font-medium">{product.name}</div>
                        <div className="ml-auto font-medium">{product.sales} unidades</div>
                      </div>
                    ))}
                  </div>
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
              {isLoading ? <Skeleton className="h-[400px] w-full" /> : <RevenueChart data={data.revenueData} />}
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
              {isLoading ? <Skeleton className="h-[400px] w-full" /> : <ProductsChart data={data.topProducts} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
