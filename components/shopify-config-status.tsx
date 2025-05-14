"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"

export function ShopifyConfigStatus() {
  const [status, setStatus] = useState<{
    isConfigured: boolean
    shopDomain?: string
    message?: string
    loading: boolean
  }>({
    isConfigured: false,
    loading: true,
  })

  useEffect(() => {
    const checkShopifyConfig = async () => {
      try {
        // Verificar si las variables de entorno están configuradas
        const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
        const hasAccessToken = !!process.env.SHOPIFY_ACCESS_TOKEN

        if (!shopDomain || !hasAccessToken) {
          setStatus({
            isConfigured: false,
            loading: false,
            message: "Las credenciales de Shopify no están configuradas",
          })
          return
        }

        // Intentar hacer una conexión de prueba
        const response = await fetch("/api/shopify/check-connection")
        const data = await response.json()

        setStatus({
          isConfigured: data.success,
          shopDomain,
          message: data.message,
          loading: false,
        })
      } catch (error) {
        console.error("Error al verificar la configuración de Shopify:", error)
        setStatus({
          isConfigured: false,
          loading: false,
          message: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    checkShopifyConfig()
  }, [])

  if (status.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verificando configuración de Shopify</CardTitle>
          <CardDescription>Comprobando la conexión con Shopify...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la conexión con Shopify</CardTitle>
        <CardDescription>
          {status.isConfigured ? `Conectado a ${status.shopDomain}` : "No se ha podido establecer conexión con Shopify"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={status.isConfigured ? "default" : "destructive"}>
          {status.isConfigured ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{status.isConfigured ? "Conexión establecida" : "Error de conexión"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/settings/shopify">
            <Settings className="mr-2 h-4 w-4" />
            Configurar Shopify
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
