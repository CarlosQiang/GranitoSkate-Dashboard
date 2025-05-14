"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { ShopifyConfigStatus } from "@/components/shopify-config-status"

export function InitStatus() {
  const [dbStatus, setDbStatus] = useState<{
    isInitialized: boolean
    message?: string
    loading: boolean
  }>({
    isInitialized: false,
    loading: true,
  })

  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db/check")
        const data = await response.json()

        setDbStatus({
          isInitialized: data.isInitialized,
          message: data.message,
          loading: false,
        })
      } catch (error) {
        console.error("Error al verificar el estado de la base de datos:", error)
        setDbStatus({
          isInitialized: false,
          message: error instanceof Error ? error.message : "Error desconocido",
          loading: false,
        })
      }
    }

    checkDbStatus()
  }, [])

  const handleInitDb = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch("/api/db/init", { method: "POST" })
      const data = await response.json()

      setDbStatus({
        isInitialized: data.success,
        message: data.message,
        loading: false,
      })
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error)
      setDbStatus({
        isInitialized: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        loading: false,
      })
    } finally {
      setIsInitializing(false)
    }
  }

  if (dbStatus.loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Verificando estado del sistema</CardTitle>
            <CardDescription>Comprobando la base de datos...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Estado de la base de datos</CardTitle>
          <CardDescription>
            {dbStatus.isInitialized
              ? "La base de datos está inicializada y lista para usar"
              : "La base de datos necesita ser inicializada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={dbStatus.isInitialized ? "default" : "destructive"}>
            {dbStatus.isInitialized ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{dbStatus.isInitialized ? "Base de datos lista" : "Acción requerida"}</AlertTitle>
            <AlertDescription>{dbStatus.message}</AlertDescription>
          </Alert>
        </CardContent>
        {!dbStatus.isInitialized && (
          <CardFooter>
            <Button onClick={handleInitDb} disabled={isInitializing} className="w-full">
              {isInitializing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Inicializando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Inicializar base de datos
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      <ShopifyConfigStatus />
    </div>
  )
}
