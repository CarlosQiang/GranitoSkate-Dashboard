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
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "warning">("loading")
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

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("connected")
        setMessage(`Conectado a ${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOM || "tu tienda Shopify"}`)
      } else if (response.status === 401 || response.status === 403) {
        setStatus("error")
        setMessage("Error de autenticación. Verifica tus credenciales de Shopify.")
      } else if (response.status >= 500) {
        setStatus("warning")
        setMessage("Shopify no está disponible en este momento. Inténtalo más tarde.")
      } else {
        setStatus("error")
        setMessage(data.message || "Error al conectar con Shopify")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión. Verifica tu conexión a internet.")
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
            <span className="hidden sm:inline">{status === "connected" ? "Shopify Conectado" : "Estado Shopify"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
          {status !== "connected" && <p className="text-xs mt-1">Haz clic para verificar de nuevo</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
