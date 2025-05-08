"use client"

import { SimpleChart, PieChart } from "@/components/ui/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SeoMonitoringDashboard() {
  // Datos de ejemplo
  const keywordsRankingData = [5, 8, 12, 15, 10, 7, 4]
  const daysLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const trafficSourcesData = [60, 25, 15]
  const trafficSourcesLabels = ["Orgánico", "Directo", "Social"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SimpleChart
        title="Posición media de palabras clave"
        data={keywordsRankingData}
        labels={daysLabels}
        type="line"
      />

      <PieChart title="Fuentes de tráfico" data={trafficSourcesData} labels={trafficSourcesLabels} />

      <Card>
        <CardHeader>
          <CardTitle>Palabras clave principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>skate barcelona</span>
              <span className="font-medium text-green-600">+2 ↑</span>
            </div>
            <div className="flex justify-between items-center">
              <span>comprar skateboard</span>
              <span className="font-medium text-red-600">-1 ↓</span>
            </div>
            <div className="flex justify-between items-center">
              <span>mejores tablas de skate</span>
              <span className="font-medium text-green-600">+5 ↑</span>
            </div>
            <div className="flex justify-between items-center">
              <span>skate shop online</span>
              <span className="font-medium">0 =</span>
            </div>
            <div className="flex justify-between items-center">
              <span>accesorios skate</span>
              <span className="font-medium text-green-600">+3 ↑</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Velocidad de página</span>
                <span className="font-medium">85/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Optimización móvil</span>
                <span className="font-medium">92/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Backlinks</span>
                <span className="font-medium">68/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand h-2 rounded-full" style={{ width: "68%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Contenido</span>
                <span className="font-medium">78/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-brand h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
