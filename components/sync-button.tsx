"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SyncButtonProps {
  entityType: "productos" | "colecciones" | "clientes" | "pedidos"
  entityId?: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SyncButton({
  entityType,
  entityId,
  onSuccess,
  onError,
  className,
  variant = "default",
  size = "default",
}: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mapeo de tipos de entidades a endpoints y mensajes
  const entityConfig = {
    productos: {
      endpoint: "/api/sync/products",
      successMessage: "Productos sincronizados correctamente",
      errorMessage: "Error al sincronizar productos",
      paramName: "shopifyId",
    },
    colecciones: {
      endpoint: "/api/sync/collections",
      successMessage: "Colecciones sincronizadas correctamente",
      errorMessage: "Error al sincronizar colecciones",
      paramName: "shopifyId",
    },
    clientes: {
      endpoint: "/api/sync/clientes",
      successMessage: "Clientes sincronizados correctamente",
      errorMessage: "Error al sincronizar clientes",
      paramName: "shopifyId",
    },
    pedidos: {
      endpoint: "/api/sync/pedidos",
      successMessage: "Pedidos sincronizados correctamente",
      errorMessage: "Error al sincronizar pedidos",
      paramName: "shopifyId",
    },
  }

  const config = entityConfig[entityType]

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // Construir la URL con parámetros si es necesario
      let url = config.endpoint
      if (entityId) {
        url += `?${config.paramName}=${entityId}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || config.errorMessage)
      }

      toast({
        title: "Sincronización exitosa",
        description: data.message || config.successMessage,
        variant: "default",
      })

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (error) {
      console.error(`Error al sincronizar ${entityType}:`, error)

      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : config.errorMessage,
        variant: "destructive",
      })

      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isLoading} className={className} variant={variant} size={size}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sincronizando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sincronizar
        </>
      )}
    </Button>
  )
}
