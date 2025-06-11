"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Bug } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function PromotionsDiagnostic() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults([])
    const diagnosticResults: any[] = []

    // Test 1: Verificar autenticación
    try {
      const authResponse = await fetch("/api/auth/status")
      if (authResponse.ok) {
        const authData = await authResponse.json()
        diagnosticResults.push({
          test: "Autenticación",
          success: true,
          message: "Usuario autenticado correctamente",
          details: authData,
        })
      } else {
        diagnosticResults.push({
          test: "Autenticación",
          success: false,
          message: "Error de autenticación",
          details: `Status: ${authResponse.status}`,
        })
      }
    } catch (error) {
      diagnosticResults.push({
        test: "Autenticación",
        success: false,
        message: "Error al verificar autenticación",
        details: error instanceof Error ? error.message : "Error desconocido",
      })
    }

    // Test 2: Verificar endpoint de promociones (GET)
    try {
      const getResponse = await fetch("/api/db/promociones")
      if (getResponse.ok) {
        const getData = await getResponse.json()
        diagnosticResults.push({
          test: "GET Promociones",
          success: true,
          message: "Endpoint GET funciona correctamente",
          details: `Promociones encontradas: ${Array.isArray(getData) ? getData.length : 0}`,
        })
      } else {
        const errorData = await getResponse.json().catch(() => ({}))
        diagnosticResults.push({
          test: "GET Promociones",
          success: false,
          message: "Error en endpoint GET",
          details: errorData,
        })
      }
    } catch (error) {
      diagnosticResults.push({
        test: "GET Promociones",
        success: false,
        message: "Error al conectar con GET promociones",
        details: error instanceof Error ? error.message : "Error desconocido",
      })
    }

    // Test 3: Verificar creación de promoción (POST)
    try {
      const testPromotion = {
        titulo: `Test Promoción ${Date.now()}`,
        descripcion: "Promoción de prueba para diagnóstico",
        tipo: "PERCENTAGE_DISCOUNT",
        valor: 15,
        fechaInicio: new Date().toISOString(),
        activa: true,
      }

      console.log("🧪 Enviando datos de prueba:", testPromotion)

      const postResponse = await fetch("/api/db/promociones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPromotion),
      })

      console.log("📥 Respuesta del servidor:", postResponse.status, postResponse.statusText)

      if (postResponse.ok) {
        const postData = await postResponse.json()
        diagnosticResults.push({
          test: "POST Promoción",
          success: true,
          message: "Promoción creada exitosamente",
          details: postData,
        })
      } else {
        const errorText = await postResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { rawError: errorText }
        }

        diagnosticResults.push({
          test: "POST Promoción",
          success: false,
          message: `Error ${postResponse.status}: ${postResponse.statusText}`,
          details: errorData,
        })
      }
    } catch (error) {
      diagnosticResults.push({
        test: "POST Promoción",
        success: false,
        message: "Error al crear promoción",
        details: error instanceof Error ? error.message : "Error desconocido",
      })
    }

    // Test 4: Verificar variables de entorno
    try {
      const envResponse = await fetch("/api/system/config-check")
      if (envResponse.ok) {
        const envData = await envResponse.json()
        diagnosticResults.push({
          test: "Variables de Entorno",
          success: true,
          message: "Variables de entorno configuradas",
          details: envData,
        })
      } else {
        diagnosticResults.push({
          test: "Variables de Entorno",
          success: false,
          message: "Error al verificar variables de entorno",
          details: `Status: ${envResponse.status}`,
        })
      }
    } catch (error) {
      diagnosticResults.push({
        test: "Variables de Entorno",
        success: false,
        message: "Error al verificar configuración",
        details: error instanceof Error ? error.message : "Error desconocido",
      })
    }

    setResults(diagnosticResults)
    setIsRunning(false)

    // Mostrar resumen
    const failedTests = diagnosticResults.filter((r) => !r.success)
    if (failedTests.length === 0) {
      toast({
        title: "✅ Diagnóstico completado",
        description: "Todos los tests pasaron correctamente",
      })
    } else {
      toast({
        title: "⚠️ Problemas encontrados",
        description: `${failedTests.length} test(s) fallaron`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Diagnóstico de Promociones
        </CardTitle>
        <CardDescription>
          Ejecuta una serie de pruebas para identificar problemas en el sistema de promociones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostic} disabled={isRunning} className="w-full">
          <Loader2 className={`mr-2 h-4 w-4 ${isRunning ? "animate-spin" : "hidden"}`} />
          <Bug className={`mr-2 h-4 w-4 ${isRunning ? "hidden" : ""}`} />
          {isRunning ? "Ejecutando diagnóstico..." : "Ejecutar Diagnóstico Completo"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados del Diagnóstico:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${
                  result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.test}
                  </span>
                </div>
                <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium">Ver detalles</summary>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {typeof result.details === "string" ? result.details : JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
