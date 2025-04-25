"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
        <p className="text-muted-foreground">Analiza el rendimiento de tu tienda</p>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="traffic">Tráfico</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas totales</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">€12,345.67</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">145</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor medio</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">€85.14</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de conversión</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">3.2%</div>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ventas por período</CardTitle>
              <CardDescription>Comparativa de ventas en los últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <LineChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fuentes de tráfico</CardTitle>
                <CardDescription>De dónde provienen tus visitantes</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <PieChart />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Páginas más visitadas</CardTitle>
                <CardDescription>Las páginas más populares de tu tienda</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { page: "Página de inicio", visits: 1245 },
                      { page: "Tablas de skate", visits: 876 },
                      { page: "Ruedas", visits: 654 },
                      { page: "Ejes", visits: 432 },
                      { page: "Ropa", visits: 321 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="font-medium">{item.page}</div>
                        <div>{item.visits} visitas</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos más vendidos</CardTitle>
              <CardDescription>Los productos con mayor número de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { product: "Tabla completa GranitoSkate Pro", sales: 42 },
                    { product: "Ruedas Spitfire Formula Four", sales: 38 },
                    { product: "Ejes Thunder Titanium", sales: 27 },
                    { product: "Camiseta GranitoSkate Logo", sales: 24 },
                    { product: "Zapatillas Vans Old Skool", sales: 19 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="font-medium">{item.product}</div>
                      <div>{item.sales} ventas</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por categoría</CardTitle>
              <CardDescription>Ventas por categoría de producto</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <BarChart />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
