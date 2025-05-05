"use client"

import { SystemDiagnostics } from "@/components/system-diagnostics"
import EnvDiagnostics from "@/components/env-diagnostics"

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Diagnósticos del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnvDiagnostics />
        <SystemDiagnostics />
      </div>
    </div>
  )
}
