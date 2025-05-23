"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function SystemDiagnostics() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(0)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    const tests = [
      {
        name: "Conexión a Shopify",
        endpoint: "/api/shopify/check",
        description: "Verifica la conexión con la API de Shopify",
      },
      {
        name: "Carga de productos",
        endpoint: "/api/shopify/diagnostics?type=products",
        description: "Verifica la carga de productos desde Shopify",
      },
      {
        name: "Carga de colecciones",
        endpoint: "/api/shopify/diagnostics?type=collections",
        description: "Verifica la carga de colecciones desde Shopify",
      },
      {
        name: "Carga de pedidos",
        endpoint: "/api/shopify/diagnostics?type=orders",
        description: "Verifica la carga de pedidos desde Shopify",
      },
      {
        name: "Carga de promociones",
        endpoint: "/api/shopify/diagnostics?type=promotions",
        description: "Verifica la carga de promociones desde Shopify",
      },
    ]

    const totalTests = tests.length
    let completedTests = 0

    for (const test of tests) {
      try {
        setResults((prev) => [...prev, { ...test, status: "running" }])

        const response = await fetch(test.endpoint)
        const data = await response.json()

        const success = response.ok && data.success

        setResults((prev) =>
          prev.map((item) =>
            item.name === test.name
              ? {
                  ...item,
                  status: success ? "success" : "error",
                  message: data.message || (success ? "OK" : "Error"),
                  details: data.details || null,
                }
              : item,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((item) =>
            item.name === test.name
              ? {
                  ...item,
                  status: "error",
                  message: error.message || "Error de conexión",
                }
              : item,
          ),
        )
      }

      completedTests++
      setProgress(Math.round((completedTests / totalTests) * 100))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnóstico del sistema</span>
          <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Ejecutando..." : "Ejecutar diagnóstico"}
          </Button>
        </CardTitle>
        <CardDescription>Verifica el estado de la conexión con Shopify y otros servicios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <h3 className="font-medium">{result.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    result.status === "success"
                      ? "text-green-600"
                      : result.status === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {result.message || (result.status === "running" ? "Ejecutando..." : "")}
                </div>
              </div>

              {result.details && (
                <div className="mt-2 text-xs bg-gray-50 p-2 rounded border">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
