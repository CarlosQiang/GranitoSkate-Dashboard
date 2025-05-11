"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { runAllChecks } from "@/lib/api-check"

export default function APIDiagnostics() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      setError(null)
      const checkResults = await runAllChecks()
      setResults(checkResults)
    } catch (err) {
      console.error("Error running diagnostics:", err)
      setError(err.message || "Error al ejecutar diagnósticos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const renderStatusBadge = (success) => {
    if (success) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Correcto
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Diagnóstico de API</CardTitle>
            <CardDescription>Verificación de conexión con Shopify y APIs</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : results ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">Conexión con Shopify</p>
                <p className="text-sm text-muted-foreground">
                  {results.connection.success
                    ? `Conectado a ${results.connection.shop?.name}`
                    : results.connection.details}
                </p>
              </div>
              {renderStatusBadge(results.connection.success)}
            </div>

            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">API de Pedidos</p>
                <p className="text-sm text-muted-foreground">
                  {results.orders.success ? `Funcionando correctamente` : results.orders.details}
                </p>
              </div>
              {renderStatusBadge(results.orders.success)}
            </div>

            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">API de Clientes</p>
                <p className="text-sm text-muted-foreground">
                  {results.customers.success ? `Funcionando correctamente` : results.customers.details}
                </p>
              </div>
              {renderStatusBadge(results.customers.success)}
            </div>

            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">API de Promociones</p>
                <p className="text-sm text-muted-foreground">
                  {results.promotions.success ? `Funcionando correctamente` : results.promotions.details}
                </p>
              </div>
              {renderStatusBadge(results.promotions.success)}
            </div>
          </div>
        ) : (
          <p className="text-center py-4">No hay resultados disponibles</p>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full">
          {results && (
            <Alert variant={results.allSuccessful ? "default" : "destructive"}>
              {results.allSuccessful ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{results.allSuccessful ? "Todo correcto" : "Se encontraron problemas"}</AlertTitle>
              <AlertDescription>
                {results.allSuccessful
                  ? "Todas las APIs están funcionando correctamente"
                  : "Algunas APIs no están funcionando correctamente. Revisa los detalles arriba."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
