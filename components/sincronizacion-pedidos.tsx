"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react"

export default function SincronizacionPedidos() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  const handleSync = async () => {
    setIsLoading(true)
    setStatus("syncing")
    setProgress(0)

    try {
      // Simular progreso
      for (let i = 0; i <= 100; i += 15) {
        setProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 350))
      }

      setStatus("success")
    } catch (error) {
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Sincronización de Pedidos
        </CardTitle>
        <CardDescription>Sincroniza los pedidos entre Shopify y la base de datos local</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "syncing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sincronizando pedidos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Sincronización completada exitosamente</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Error en la sincronización</span>
          </div>
        )}

        <Button onClick={handleSync} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Pedidos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
