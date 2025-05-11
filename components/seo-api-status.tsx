"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SeoApiStatusProps {
  checkEndpoint: string
  refreshInterval?: number // en milisegundos
}

export function SeoApiStatus({ checkEndpoint, refreshInterval = 60000 }: SeoApiStatusProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(100)

  const checkApiStatus = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      const response = await fetch(checkEndpoint)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setErrorMessage(null)
      } else {
        setStatus("error")
        setErrorMessage(data.message || "Error desconocido")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage((error as Error).message || "Error al conectar con la API")
    } finally {
      setIsChecking(false)
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkApiStatus()

    // Configurar intervalo para verificar periódicamente
    const intervalId = setInterval(() => {
      checkApiStatus()
    }, refreshInterval)

    // Configurar intervalo para actualizar la barra de progreso
    const progressIntervalId = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (refreshInterval / 1000)
        return newProgress < 0 ? 0 : newProgress
      })
    }, 1000)

    return () => {
      clearInterval(intervalId)
      clearInterval(progressIntervalId)
    }
  }, [checkEndpoint, refreshInterval])

  // Reiniciar la barra de progreso después de cada verificación
  useEffect(() => {
    if (lastChecked) {
      setProgress(100)
    }
  }, [lastChecked])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {status === "connected" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <RefreshCw className="h-5 w-5 animate-spin" />
          )}
          Estado de la API de SEO
        </CardTitle>
        <Badge variant={status === "connected" ? "success" : status === "error" ? "destructive" : "outline"}>
          {status === "connected" ? "Conectado" : status === "error" ? "Error" : "Verificando..."}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>
          {status === "connected"
            ? "La API de SEO está funcionando correctamente."
            : status === "error"
              ? `Error en la API de SEO: ${errorMessage}`
              : "Verificando el estado de la API de SEO..."}
        </CardDescription>

        {lastChecked && (
          <div className="text-xs text-muted-foreground">Última verificación: {lastChecked.toLocaleString()}</div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Próxima verificación</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Button variant="outline" size="sm" onClick={checkApiStatus} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar ahora
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
