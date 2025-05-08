import { SimpleChart } from "@/components/ui/charts"

export default function AnalyticsPage() {
  // Datos de ejemplo
  const salesData = [1200, 1500, 1000, 1800, 2200, 1600, 1900]
  const daysLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analíticas</h1>
          <p className="text-muted-foreground">Visualiza el rendimiento de tu tienda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SimpleChart title="Ventas por día" data={salesData} labels={daysLabels} type="bar" />

        <SimpleChart title="Tendencia de ventas" data={salesData} labels={daysLabels} type="line" />
      </div>

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Datos de ejemplo</h2>
        <p className="text-yellow-700">
          Actualmente se muestran datos de ejemplo. La conexión con Shopify para datos reales estará disponible
          próximamente.
        </p>
      </div>
    </div>
  )
}
