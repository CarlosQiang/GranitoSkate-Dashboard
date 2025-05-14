"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShopifyCredentialsForm } from "@/components/shopify-credentials-form"
import { ShopifyManualConfig } from "@/components/shopify-manual-config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function ShopifySetup() {
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
            })
            return
          }
        }

        // Si no hay credenciales temporales o no funcionaron, verificar las variables de entorno
        const response = await fetch("/api/shopify/check-connection")
        const data = await response.json()

        setStatus({
          isConfigured: data.success,
          shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
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

  return (
    <div className="space-y-6">
      {status.loading ? (
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
      ) : (
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
        </Card>
      )}

      <Tabs defaultValue="manual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Configuración Manual</TabsTrigger>
          <TabsTrigger value="vercel">Configuración en Vercel</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-4">
          <ShopifyManualConfig />
        </TabsContent>
        <TabsContent value="vercel" className="mt-4">
          <ShopifyCredentialsForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
