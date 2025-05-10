import { SimpleChart, PieChart } from "@/components/ui/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para evitar errores
const sampleData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Visibilidad SEO",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: "#d29a43",
      borderColor: "#d29a43",
    },
  ],
}

// Datos de ejemplo para el gráfico de pastel
const pieData = [
  { name: "Google", value: 65 },
  { name: "Bing", value: 15 },
  { name: "Yahoo", value: 10 },
  { name: "Otros", value: 10 },
]

export function SEOMonitoringDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Monitorización SEO</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="keywords">Palabras Clave</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibilidad SEO</CardTitle>
                <CardDescription>Evolución de la visibilidad en buscadores</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={sampleData} title="Visibilidad SEO" type="line" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tráfico</CardTitle>
                <CardDescription>Tráfico por buscador</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-md">
                  <PieChart
                    data={pieData}
                    colors={["#d29a43", "#3b82f6", "#10b981", "#f59e0b"]}
                    height={300}
                    valueFormatter={(value) => `${value}%`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Posiciones de Palabras Clave</CardTitle>
                <CardDescription>Evolución de posiciones</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={{
                    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "Posición media",
                        data: [15, 12, 10, 8, 7, 6, 5],
                        backgroundColor: "#10b981",
                        borderColor: "#10b981",
                      },
                    ],
                  }}
                  title="Posiciones de Palabras Clave"
                  type="line"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backlinks</CardTitle>
                <CardDescription>Evolución de backlinks</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart
                  data={{
                    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
                    datasets: [
                      {
                        label: "Nuevos backlinks",
                        data: [5, 8, 12, 15, 20, 25, 30],
                        backgroundColor: "#3b82f6",
                        borderColor: "#3b82f6",
                      },
                    ],
                  }}
                  title="Backlinks"
                  type="bar"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Palabras Clave</CardTitle>
              <CardDescription>Datos detallados de palabras clave</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de palabras clave...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlinks">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Backlinks</CardTitle>
              <CardDescription>Datos detallados de backlinks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de backlinks...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Competidores</CardTitle>
              <CardDescription>Datos detallados de competidores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contenido detallado de competidores...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
