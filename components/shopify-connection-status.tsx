"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ShopifyConnectionStatusProps {
  className?: string
}

export function ShopifyConnectionStatus({ className }: ShopifyConnectionStatusProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "warning" | "demo">("loading")
  const [message, setMessage] = useState<string>("Verificando conexión...")
  const [isChecking, setIsChecking] = useState<boolean>(false)

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("loading")
    setMessage("Verificando conexión...")

    try {
      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        setStatus("warning")
        setMessage("No se pudo verificar la conexión. Usando datos de demostración.")
        setIsChecking(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setMessage(`Conectado a ${data.shop?.name || "Shopify"}`)
      } else if (data.usingMockData) {
        setStatus("demo")
        setMessage("Usando datos de demostración")
      } else if (data.message?.includes("autenticación") || data.message?.includes("token")) {
        setStatus("error")
        setMessage("Error de autenticación. Verifica tus credenciales de Shopify.")
      } else {
        setStatus("warning")
        setMessage(data.message || "No se pudo conectar con Shopify. Usando datos de demostración.")
      }
    } catch (error) {
      setStatus("warning")
      setMessage("Error de conexión. Usando datos de demostración.")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()

    // Verificar la conexión cada 5 minutos
    const interval = setInterval(checkConnection, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
      case "demo":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "loading":
      default:
        return <RefreshCw className={`h-4 w-4 text-blue-500 ${isChecking ? "animate-spin" : ""}`} />
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-2 text-xs", className)}
            onClick={checkConnection}
            disabled={isChecking}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">
              {status === "connected" ? "Shopify Conectado" : status === "demo" ? "Modo Demo" : "Estado Shopify"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
          {status !== "connected" && <p className="text-xs mt-1">Haz clic para verificar de nuevo</p>}
          {status === "demo" && (
            <p className="text-xs mt-1">
              Los datos mostrados son de demostración y no reflejan información real de Shopify.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
