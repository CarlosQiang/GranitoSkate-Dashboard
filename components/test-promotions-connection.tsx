"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, TestTube } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TestPromotionsConnection() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      console.log("🧪 Probando conexión de promociones...")

      // Datos de prueba
      const testData = {
        titulo: `Promoción de Prueba ${Date.now()}`,
        descripcion: "Esta es una promoción de prueba para verificar la conexión",
        tipo: "PERCENTAGE_DISCOUNT",
        valor: 10,
        fechaInicio: new Date().toISOString(),
        activa: true,
      }

      const response = await fetch("/api/db/promociones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP: ${response.status}`)
      }

      const result = await response.json()

      setTestResult({
        success: true,
        message: "✅ Conexión exitosa - Las promociones se pueden crear correctamente",
        details: result,
      })

      toast({
        title: "Prueba exitosa",
        description: "La conexión para crear promociones funciona correctamente",
      })
    } catch (error) {
      console.error("❌ Error en prueba:", error)

      setTestResult({
        success: false,
        message: `❌ Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })

      toast({
        title: "Error en la prueba",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Prueba de Conexión - Promociones
        </CardTitle>
        <CardDescription>Verifica que el sistema puede crear promociones correctamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTest} disabled={isLoading} className="w-full">
          <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : "hidden"}`} />
          <TestTube className={`mr-2 h-4 w-4 ${isLoading ? "hidden" : ""}`} />
          {isLoading ? "Probando conexión..." : "Probar Creación de Promociones"}
        </Button>

        {testResult && (
          <div
            className={`p-4 border rounded-lg ${testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                Resultado de la Prueba
              </span>
            </div>
            <p className={`text-sm ${testResult.success ? "text-green-700" : "text-red-700"}`}>{testResult.message}</p>
            {testResult.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Ver detalles</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
