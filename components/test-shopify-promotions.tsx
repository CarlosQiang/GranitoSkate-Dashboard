"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, TestTube } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TestShopifyPromotions() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])
    const results: any[] = []

    // Test 1: Verificar credenciales de Shopify
    try {
      console.log("🧪 Test 1: Verificando credenciales de Shopify...")

      const credentialsTest = await fetch("/api/shopify/check", {
        method: "GET",
      })

      if (credentialsTest.ok) {
        const credData = await credentialsTest.json()
        results.push({
          test: "Credenciales Shopify",
          success: true,
          message: "Credenciales configuradas correctamente",
          details: credData,
        })
      } else {
        results.push({
          test: "Credenciales Shopify",
          success: false,
          message: "Error en credenciales de Shopify",
          details: `Status: ${credentialsTest.status}`,
        })
      }
    } catch (error) {
      results.push({
        test: "Credenciales Shopify",
        success: false,
        message: "Error al verificar credenciales",
        details: error.message,
      })
    }

    // Test 2: Probar consulta GraphQL básica
    try {
      console.log("🧪 Test 2: Probando consulta GraphQL básica...")

      const graphqlTest = await fetch("/api/shopify/test-graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              shop {
                name
                id
              }
            }
          `,
        }),
      })

      if (graphqlTest.ok) {
        const graphqlData = await graphqlTest.json()
        results.push({
          test: "GraphQL Básico",
          success: true,
          message: "Consulta GraphQL funciona",
          details: graphqlData,
        })
      } else {
        const errorData = await graphqlTest.json().catch(() => ({}))
        results.push({
          test: "GraphQL Básico",
          success: false,
          message: "Error en consulta GraphQL",
          details: errorData,
        })
      }
    } catch (error) {
      results.push({
        test: "GraphQL Básico",
        success: false,
        message: "Error al probar GraphQL",
        details: error.message,
      })
    }

    // Test 3: Probar creación real de promoción en Shopify
    try {
      console.log("🧪 Test 3: Probando creación REAL de promoción...")

      const testPromotion = {
        titulo: `Test Promoción ${Date.now()}`,
        descripcion: "Promoción de prueba para diagnóstico",
        tipo: "PORCENTAJE_DESCUENTO",
        valor: "5",
        fechaInicio: new Date().toISOString(),
        codigo: "", // Sin código = descuento automático
      }

      const createTest = await fetch("/api/shopify/promotions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPromotion),
      })

      const createData = await createTest.json()

      if (createTest.ok && createData.success) {
        results.push({
          test: "Creación de Promoción",
          success: true,
          message: "Promoción creada exitosamente en Shopify",
          details: createData,
        })
      } else {
        results.push({
          test: "Creación de Promoción",
          success: false,
          message: "Error al crear promoción",
          details: createData,
        })
      }
    } catch (error) {
      results.push({
        test: "Creación de Promoción",
        success: false,
        message: "Error al probar creación",
        details: error.message,
      })
    }

    // Test 4: Verificar promociones existentes
    try {
      console.log("🧪 Test 4: Verificando promociones existentes...")

      const listTest = await fetch("/api/shopify/promotions", {
        method: "GET",
      })

      if (listTest.ok) {
        const listData = await listTest.json()
        results.push({
          test: "Listar Promociones",
          success: true,
          message: `Encontradas ${listData.length || 0} promociones`,
          details: listData,
        })
      } else {
        results.push({
          test: "Listar Promociones",
          success: false,
          message: "Error al listar promociones",
          details: `Status: ${listTest.status}`,
        })
      }
    } catch (error) {
      results.push({
        test: "Listar Promociones",
        success: false,
        message: "Error al listar promociones",
        details: error.message,
      })
    }

    setTestResults(results)
    setIsLoading(false)

    // Mostrar resumen
    const failedTests = results.filter((r) => !r.success)
    if (failedTests.length === 0) {
      toast({
        title: "✅ Todos los tests pasaron",
        description: "La integración con Shopify funciona correctamente",
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
          <TestTube className="h-5 w-5" />
          Diagnóstico de Promociones Shopify
        </CardTitle>
        <CardDescription>Ejecuta pruebas para verificar la integración con Shopify</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading} className="w-full">
          <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : "hidden"}`} />
          <TestTube className={`mr-2 h-4 w-4 ${isLoading ? "hidden" : ""}`} />
          {isLoading ? "Ejecutando tests..." : "Ejecutar Diagnóstico Completo"}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados del Diagnóstico:</h3>
            {testResults.map((result, index) => (
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
