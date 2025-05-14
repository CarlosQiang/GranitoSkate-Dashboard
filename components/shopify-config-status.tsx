"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"
import { ShopifyManualConfig } from "./shopify-manual-config"

export function ShopifyConfigStatus() {
  const [status, setStatus] = useState<{
    isConfigured: boolean
    shopDomain?: string
    message?: string
    loading: boolean
    showManualConfig: boolean
  }>({
    isConfigured: false,
    loading: true,
    showManualConfig: false,
  })

  useEffect(() => {
    const checkShopifyConfig = async () => {
      try {
        // Verificar si hay credenciales temporales en localStorage
        const tempShopDomain = localStorage.getItem("shopify_domain")
        const tempAccessToken = localStorage.getItem("shopify_token")

        if (tempShopDomain && tempAccessToken) {
          // Probar la conexión con las credenciales temporales
          const response = await fetch("/api/shopify/test-connection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shopDomain: tempShopDomain,
              accessToken: tempAccessToken,
            }),
          })

          const data = await response.json()

          if (data.success) {
            setStatus({
              isConfigured: true,
              shopDomain: tempShopDomain,
              message: `Usando credenciales temporales: ${data.message}`,
              loading: false,
              showManualConfig: false,
            })
            return
          }
        }

        // Si no hay credenciales temporales o no funcionaron, verificar las variables de entorno
        const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN

        if (!shopDomain) {
          setStatus({
            isConfigured: false,
            loading: false,
            message: "Las credenciales de Shopify no están configuradas",
            showManualConfig: true,
          })
          return
        }

        // Intentar hacer una conexión de prueba con las variables de entorno
        const response = await fetch("/api/shopify/check-connection")
        const data = await response.json()

        setStatus({
          isConfigured: data.success,
          shopDomain,
          message: data.message,
          loading: false,
          showManualConfig: !data.success,
        })
      } catch (error) {
        console.error("Error al verificar la configuración de Shopify:", error)
        setStatus({
          isConfigured: false,
          loading: false,
          message: error instanceof Error ? error.message : "Error desconocido",
          showManualConfig: true,
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Estado de la conexión con Shopify</CardTitle>
          <CardDescription>
            {status.isConfigured
              ? `Conectado a ${status.shopDomain}`
              : "No se ha podido establecer conexión con Shopify"}
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

      {status.showManualConfig && (
        <div className="mt-6">
          <ShopifyManualConfig />
        </div>
      )}
    </>
  )
}
