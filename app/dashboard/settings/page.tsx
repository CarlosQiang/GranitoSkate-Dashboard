"use client"

import { useEffect, useState } from "react"
import { shopifyFetch } from "@/lib/shopify"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [shopConfig, setShopConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShopConfig = async () => {
      try {
        setLoading(true)
        const query = `
          query {
            shop {
              name
              email
              primaryDomain {
                url
              }
              billingAddress {
                address1
                address2
                city
                province
                zip
                country
                phone
              }
              currencyCode
              paymentSettings {
                supportedDigitalWallets
              }
            }
          }
        `

        const response = await shopifyFetch({
          query,
          variables: {},
        })

        if (!response.data) {
          throw new Error("No se pudo obtener la configuración de la tienda")
        }

        setShopConfig(response.data.shop)
        setError(null)
      } catch (err: any) {
        console.error("Error al cargar la configuración:", err)
        setError(`Error al cargar la configuración: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchShopConfig()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configuración de la tienda</h1>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : shopConfig ? (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Pagos</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información general</CardTitle>
                <CardDescription>Configuración básica de tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Nombre de la tienda</h3>
                  <p className="text-muted-foreground">{shopConfig.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">URL de la tienda</h3>
                  <p className="text-muted-foreground">{shopConfig.primaryDomain?.url}</p>
                </div>
                <div>
                  <h3 className="font-medium">Moneda</h3>
                  <p className="text-muted-foreground">{shopConfig.currencyCode}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de pagos</CardTitle>
                <CardDescription>Métodos de pago aceptados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Monederos digitales soportados</h3>
                  {shopConfig.paymentSettings?.supportedDigitalWallets?.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground">
                      {shopConfig.paymentSettings.supportedDigitalWallets.map((wallet: string) => (
                        <li key={wallet}>{wallet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No hay monederos digitales configurados</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
                <CardDescription>Datos de contacto de la tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">{shopConfig.email}</p>
                </div>
                {shopConfig.billingAddress && (
                  <>
                    <div>
                      <h3 className="font-medium">Dirección</h3>
                      <p className="text-muted-foreground">
                        {shopConfig.billingAddress.address1}
                        {shopConfig.billingAddress.address2 && `, ${shopConfig.billingAddress.address2}`}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Ciudad</h3>
                      <p className="text-muted-foreground">
                        {shopConfig.billingAddress.city}, {shopConfig.billingAddress.province},{" "}
                        {shopConfig.billingAddress.zip}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">País</h3>
                      <p className="text-muted-foreground">{shopConfig.billingAddress.country}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Teléfono</h3>
                      <p className="text-muted-foreground">{shopConfig.billingAddress.phone || "No disponible"}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <p className="text-center text-muted-foreground">No se pudo cargar la configuración de la tienda</p>
      )}
    </div>
  )
}
