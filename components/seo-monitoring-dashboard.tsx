"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, PieChart } from "@/components/ui/charts"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  Search,
  ExternalLink,
  BarChart2,
  PieChartIcon,
  Download,
  RefreshCw,
} from "lucide-react"

interface SeoMetric {
  name: string
  value: number
  change: number
  unit?: string
}

interface SeoKeyword {
  keyword: string
  position: number
  change: number
  volume: number
  clicks: number
}

interface SeoPagePerformance {
  url: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

interface SeoMonitoringDashboardProps {
  shopId: string
  dateRange?: "7d" | "30d" | "90d" | "1y"
  refreshData?: () => Promise<void>
}

export function SeoMonitoringDashboard({ shopId, dateRange = "30d", refreshData }: SeoMonitoringDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange)
  const [metrics, setMetrics] = useState<SeoMetric[]>([])
  const [keywords, setKeywords] = useState<SeoKeyword[]>([])
  const [pages, setPages] = useState<SeoPagePerformance[]>([])
  const [chartData, setChartData] = useState<any>({})

  // Datos de ejemplo para la demostración
  const mockData = {
    metrics: [
      { name: "Impresiones", value: 12450, change: 5.2, unit: "" },
      { name: "Clics", value: 843, change: 7.8, unit: "" },
      { name: "CTR", value: 6.77, change: 2.5, unit: "%" },
      { name: "Posición media", value: 18.3, change: -2.1, unit: "" },
    ],
    keywords: [
      { keyword: "tablas de skate", position: 3, change: 2, volume: 1200, clicks: 87 },
      { keyword: "comprar skateboard", position: 5, change: -1, volume: 880, clicks: 62 },
      { keyword: "ruedas para skate", position: 7, change: 3, volume: 650, clicks: 45 },
      { keyword: "trucks para skateboard", position: 9, change: 0, volume: 450, clicks: 32 },
      { keyword: "skate completo", position: 12, change: 5, volume: 780, clicks: 51 },
    ],
    pages: [
      { url: "/productos/tablas", impressions: 3240, clicks: 245, ctr: 7.56, position: 4.2 },
      { url: "/productos/ruedas", impressions: 2180, clicks: 156, ctr: 7.16, position: 6.8 },
      { url: "/productos/trucks", impressions: 1850, clicks: 132, ctr: 7.14, position: 8.3 },
      { url: "/colecciones/principiantes", impressions: 1620, clicks: 98, ctr: 6.05, position: 9.7 },
      { url: "/blog/como-elegir-tabla", impressions: 980, clicks: 87, ctr: 8.88, position: 5.1 },
    ],
    chartData: {
      impressions: [
        { date: "2023-01", value: 8200 },
        { date: "2023-02", value: 8600 },
        { date: "2023-03", value: 9100 },
        { date: "2023-04", value: 9800 },
        { date: "2023-05", value: 10500 },
        { date: "2023-06", value: 11200 },
        { date: "2023-07", value: 11800 },
        { date: "2023-08", value: 12450 },
      ],
      clicks: [
        { date: "2023-01", value: 520 },
        { date: "2023-02", value: 560 },
        { date: "2023-03", value: 610 },
        { date: "2023-04", value: 650 },
        { date: "2023-05", value: 720 },
        { date: "2023-06", value: 780 },
        { date: "2023-07", value: 810 },
        { date: "2023-08", value: 843 },
      ],
      distribution: [
        { name: "Google", value: 82 },
        { name: "Bing", value: 12 },
        { name: "Yahoo", value: 4 },
        { name: "DuckDuckGo", value: 2 },
      ],
    },
  }

  const loadData = async () => {
    setIsLoading(true)

    try {
      // En una implementación real, aquí se haría una llamada a la API
      // const response = await fetch(`/api/seo/monitoring?shopId=${shopId}&dateRange=${selectedDateRange}`)
      // const data = await response.json()

      // Simulamos una carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Usamos datos de ejemplo
      setMetrics(mockData.metrics)
      setKeywords(mockData.keywords)
      setPages(mockData.pages)
      setChartData(mockData.chartData)
    } catch (error) {
      console.error("Error loading SEO monitoring data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      if (refreshData) {
        await refreshData()
      }
      await loadData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value as "7d" | "30d" | "90d" | "1y")
  }

  useEffect(() => {
    loadData()
  }, [selectedDateRange, shopId])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Monitorización SEO</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value.toLocaleString()}
                  {metric.unit}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {metric.change > 0 ? (
                    <>
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{metric.change}%</span>
                    </>
                  ) : metric.change < 0 ? (
                    <>
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                      <span className="text-red-500">{metric.change}%</span>
                    </>
                  ) : (
                    <span>Sin cambios</span>
                  )}
                  <span className="ml-1">vs. período anterior</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="mr-2 h-4 w-4" />
            Visión general
          </TabsTrigger>
          <TabsTrigger value="keywords">
            <Search className="mr-2 h-4 w-4" />
            Palabras clave
          </TabsTrigger>
          <TabsTrigger value="pages">
            <ExternalLink className="mr-2 h-4 w-4" />
            Páginas
          </TabsTrigger>
          <TabsTrigger value="sources">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Fuentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="h-80">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de impresiones y clics</CardTitle>
                <CardDescription>Evolución de las impresiones y clics en los resultados de búsqueda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <LineChart
                    data={[
                      {
                        name: "Impresiones",
                        data: chartData.impressions.map((item: any) => ({
                          x: item.date,
                          y: item.value,
                        })),
                      },
                      {
                        name: "Clics",
                        data: chartData.clicks.map((item: any) => ({
                          x: item.date,
                          y: item.value,
                        })),
                      },
                    ]}
                    categories={chartData.impressions.map((item: any) => item.date)}
                    colors={["#2563eb", "#10b981"]}
                    yAxisWidth={60}
                    showLegend={true}
                    showXAxis={true}
                    showYAxis={true}
                    showGridLines={true}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Palabras clave principales</CardTitle>
                <CardDescription>Posiciones y rendimiento de las principales palabras clave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-2 px-4 text-left font-medium">Palabra clave</th>
                        <th className="py-2 px-4 text-left font-medium">Posición</th>
                        <th className="py-2 px-4 text-left font-medium">Cambio</th>
                        <th className="py-2 px-4 text-left font-medium">Volumen</th>
                        <th className="py-2 px-4 text-left font-medium">Clics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((keyword) => (
                        <tr key={keyword.keyword} className="border-b">
                          <td className="py-2 px-4">{keyword.keyword}</td>
                          <td className="py-2 px-4">{keyword.position}</td>
                          <td className="py-2 px-4">
                            {keyword.change > 0 ? (
                              <span className="flex items-center text-green-500">
                                <TrendingUp className="mr-1 h-3 w-3" />+{keyword.change}
                              </span>
                            ) : keyword.change < 0 ? (
                              <span className="flex items-center text-red-500">
                                <TrendingDown className="mr-1 h-3 w-3" />
                                {keyword.change}
                              </span>
                            ) : (
                              <span>0</span>
                            )}
                          </td>
                          <td className="py-2 px-4">{keyword.volume.toLocaleString()}</td>
                          <td className="py-2 px-4">{keyword.clicks.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Páginas con mejor rendimiento</CardTitle>
                <CardDescription>Rendimiento de las páginas en los resultados de búsqueda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-2 px-4 text-left font-medium">URL</th>
                        <th className="py-2 px-4 text-left font-medium">Impresiones</th>
                        <th className="py-2 px-4 text-left font-medium">Clics</th>
                        <th className="py-2 px-4 text-left font-medium">CTR</th>
                        <th className="py-2 px-4 text-left font-medium">Posición</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page) => (
                        <tr key={page.url} className="border-b">
                          <td className="py-2 px-4">
                            <a
                              href={`https://granitoskate.com${page.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {page.url}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </td>
                          <td className="py-2 px-4">{page.impressions.toLocaleString()}</td>
                          <td className="py-2 px-4">{page.clicks.toLocaleString()}</td>
                          <td className="py-2 px-4">{page.ctr.toFixed(2)}%</td>
                          <td className="py-2 px-4">{page.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Distribución por buscadores</CardTitle>
                <CardDescription>Porcentaje de tráfico por motor de búsqueda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <PieChart
                    data={chartData.distribution.map((item: any) => ({
                      name: item.name,
                      value: item.value,
                    }))}
                    colors={["#2563eb", "#10b981", "#f59e0b", "#ef4444"]}
                    showLabel={true}
                    showLegend={true}
                    valueFormatter={(value) => `${value}%`}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
