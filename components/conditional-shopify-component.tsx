"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface ConditionalShopifyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalShopifyComponent({
  children,
  fallback = <Skeleton className="h-32 w-full" />,
}: ConditionalShopifyComponentProps) {
  const [isShopifyConnected, setIsShopifyConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkShopifyConnection = async () => {
      try {
        const response = await fetch("/api/shopify/check")
        if (response.ok) {
          setIsShopifyConnected(true)
        } else {
          const data = await response.json()
          setError(data.error || "Error al conectar con Shopify")
          setIsShopifyConnected(false)
        }
      } catch (err) {
        console.error("Error al verificar la conexión con Shopify:", err)
        setError("Error al verificar la conexión con Shopify")
        setIsShopifyConnected(false)
      }
    }

    checkShopifyConnection()
  }, [])

  if (isShopifyConnected === null) {
    return <>{fallback}</>
  }

  if (isShopifyConnected === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "No se pudo conectar con Shopify. Por favor, verifica tus credenciales."}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
