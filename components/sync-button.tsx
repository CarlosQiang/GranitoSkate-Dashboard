"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface SyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  entityType: "productos" | "colecciones" | "clientes" | "pedidos"
  shopifyId?: string
  onSuccess?: () => void
  onError?: (error: any) => void
  label?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SyncButton({
  entityType,
  shopifyId,
  onSuccess,
  onError,
  label,
  variant = "default",
  className,
  ...props
}: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mapeo de tipos de entidad a endpoints y mensajes
  const entityMap = {
    productos: {
      endpoint: "/api/sync/products",
      singularLabel: "producto",
      pluralLabel: "productos",
    },
    colecciones: {
      endpoint: "/api/sync/collections",
      singularLabel: "colección",
      pluralLabel: "colecciones",
    },
    clientes: {
      endpoint: "/api/sync/customers",
      singularLabel: "cliente",
      pluralLabel: "clientes",
    },
    pedidos: {
      endpoint: "/api/sync/orders",
      singularLabel: "pedido",
      pluralLabel: "pedidos",
    },
  }

  const { endpoint, singularLabel, pluralLabel } = entityMap[entityType]

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // Construir la URL con parámetros si es necesario
      let url = endpoint
      if (shopifyId) {
        url += `?shopifyId=${shopifyId}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error al sincronizar ${shopifyId ? singularLabel : pluralLabel}`)
      }

      const data = await response.json()

      toast({
        title: "Sincronización completada",
        description: data.message || `${shopifyId ? singularLabel : pluralLabel} sincronizado(s) correctamente`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Error al sincronizar ${entityType}:`, error)

      toast({
        title: "Error de sincronización",
        description: error instanceof Error ? error.message : `Error al sincronizar ${pluralLabel}`,
        variant: "destructive",
      })

      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Determinar el texto del botón
  const buttonText = label || (shopifyId ? `Sincronizar ${singularLabel}` : `Sincronizar ${pluralLabel}`)

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant={variant}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {buttonText}
    </Button>
  )
}
