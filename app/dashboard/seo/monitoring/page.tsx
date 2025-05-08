import { SeoMonitoringDashboard } from "@/components/seo-monitoring-dashboard"

export default function SeoMonitoringPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoreo SEO</h1>
          <p className="text-muted-foreground">Seguimiento del rendimiento SEO de tu tienda</p>
        </div>
      </div>

      <SeoMonitoringDashboard />

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Datos de ejemplo</h2>
        <p className="text-yellow-700">
          Actualmente se muestran datos de ejemplo. La conexión con herramientas de SEO para datos reales estará
          disponible próximamente.
        </p>
      </div>
    </div>
  )
}
