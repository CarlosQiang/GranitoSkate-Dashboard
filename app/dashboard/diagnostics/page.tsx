import { SystemDiagnostics } from "@/components/system-diagnostics"

export default function DiagnosticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnósticos del Sistema</h1>
          <p className="text-muted-foreground">Verifica el estado de los componentes del sistema</p>
        </div>
      </div>

      <SystemDiagnostics />

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Información de diagnóstico</h2>
        <p className="text-yellow-700">
          Esta página muestra información simulada para fines de demostración. Los diagnósticos reales estarán
          disponibles en futuras actualizaciones.
        </p>
      </div>
    </div>
  )
}
