"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    general: {
      storeName: "",
      email: "",
      phone: "",
      address: "",
    },
    regional: {
      currency: "EUR",
      language: "es",
    },
    shipping: {
      standard: {
        enabled: true,
        price: "5.00",
      },
      express: {
        enabled: true,
        price: "10.00",
      },
      free: {
        enabled: true,
        threshold: "50.00",
      },
      countries: {
        spain: true,
        eu: true,
        worldwide: false,
      },
    },
    payments: {
      methods: {
        card: true,
        paypal: true,
        transfer: true,
        cod: false,
      },
      tax: {
        rate: "21",
        included: true,
      },
    },
    notifications: {
      admin: {
        orders: true,
        stock: true,
        returns: true,
        reviews: false,
      },
      customer: {
        order: true,
        shipping: true,
        delivery: true,
        abandoned: false,
      },
    },
  })

  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        setIsLoading(true)

        // Consulta para obtener la configuración de la tienda
        const query = gql`
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
              shippingSettings {
                zones {
                  name
                  countries {
                    code
                  }
                  carrierServices {
                    name
                    active
                  }
                  priceRules {
                    name
                    price {
                      amount
                    }
                    minOrderSubtotal {
                      amount
                    }
                  }
                }
              }
              taxSettings {
                chargeTaxOnShipping
              }
            }
          }
        `

        const data = await shopifyClient.request(query)

        if (data && data.shop) {
          const shop = data.shop

          // Actualizar el estado con los datos de la tienda
          setSettings((prev) => ({
            ...prev,
            general: {
              storeName: shop.name || "",
              email: shop.email || "",
              phone: shop.billingAddress?.phone || "",
              address: [
                shop.billingAddress?.address1,
                shop.billingAddress?.city,
                shop.billingAddress?.province,
                shop.billingAddress?.zip,
                shop.billingAddress?.country,
              ]
                .filter(Boolean)
                .join(", "),
            },
            regional: {
              currency: shop.currencyCode || "EUR",
              language: "es", // Por defecto español
            },
          }))
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de la tienda",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopSettings()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Guardar configuración general
      const updateShopMutation = gql`
        mutation updateShop($input: ShopInput!) {
          shopUpdate(input: $input) {
            shop {
              id
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const updateResult = await shopifyClient.request(updateShopMutation, {
        input: {
          name: settings.general.storeName,
        },
      })

      if (updateResult.shopUpdate.userErrors && updateResult.shopUpdate.userErrors.length > 0) {
        throw new Error(updateResult.shopUpdate.userErrors[0].message)
      }

      // Guardar metafields para configuraciones adicionales
      const metafieldsMutation = gql`
        mutation setMetafields($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `

      const metafieldsInput = [
        {
          namespace: "settings",
          key: "shipping",
          value: JSON.stringify(settings.shipping),
          type: "json",
          ownerId: "gid://shopify/Shop/1",
        },
        {
          namespace: "settings",
          key: "payments",
          value: JSON.stringify(settings.payments),
          type: "json",
          ownerId: "gid://shopify/Shop/1",
        },
        {
          namespace: "settings",
          key: "notifications",
          value: JSON.stringify(settings.notifications),
          type: "json",
          ownerId: "gid://shopify/Shop/1",
        },
      ]

      const metafieldsResult = await shopifyClient.request(metafieldsMutation, {
        metafields: metafieldsInput,
      })

      if (metafieldsResult.metafieldsSet.userErrors && metafieldsResult.metafieldsSet.userErrors.length > 0) {
        throw new Error(metafieldsResult.metafieldsSet.userErrors[0].message)
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración ha sido guardada correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: `No se pudo guardar la configuración: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Gestiona la configuración de tu tienda</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Envío</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la tienda</CardTitle>
              <CardDescription>Información básica sobre tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nombre de la tienda</Label>
                <Input
                  id="store-name"
                  placeholder="Nombre de tu tienda"
                  value={settings.general.storeName}
                  onChange={(e) => handleInputChange("general", "storeName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Email de contacto</Label>
                <Input
                  id="store-email"
                  type="email"
                  placeholder="email@tutienda.com"
                  value={settings.general.email}
                  onChange={(e) => handleInputChange("general", "email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Teléfono</Label>
                <Input
                  id="store-phone"
                  type="tel"
                  placeholder="+34 XXX XXX XXX"
                  value={settings.general.phone}
                  onChange={(e) => handleInputChange("general", "phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Dirección</Label>
                <Textarea
                  id="store-address"
                  placeholder="Dirección de tu tienda"
                  value={settings.general.address}
                  onChange={(e) => handleInputChange("general", "address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias regionales</CardTitle>
              <CardDescription>Configura la moneda y el idioma de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.regional.currency}
                  onChange={(e) => handleInputChange("regional", "currency", e.target.value)}
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar estadounidense ($)</option>
                  <option value="GBP">Libra esterlina (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.regional.language}
                  onChange={(e) => handleInputChange("regional", "language", e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de envío</CardTitle>
              <CardDescription>Configura los métodos de envío disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="shipping-standard">Envío estándar</Label>
                  <p className="text-sm text-muted-foreground">3-5 días laborables</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="shipping-standard-price"
                    className="w-20"
                    placeholder="0.00"
                    value={settings.shipping.standard.price}
                    onChange={(e) => handleNestedInputChange("shipping", "standard", "price", e.target.value)}
                  />
                  <Switch
                    id="shipping-standard"
                    checked={settings.shipping.standard.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange("shipping", "standard", "enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="shipping-express">Envío express</Label>
                  <p className="text-sm text-muted-foreground">1-2 días laborables</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="shipping-express-price"
                    className="w-20"
                    placeholder="0.00"
                    value={settings.shipping.express.price}
                    onChange={(e) => handleNestedInputChange("shipping", "express", "price", e.target.value)}
                  />
                  <Switch
                    id="shipping-express"
                    checked={settings.shipping.express.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange("shipping", "express", "enabled", checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="shipping-free">Envío gratuito</Label>
                  <p className="text-sm text-muted-foreground">Para pedidos superiores a</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="shipping-free-threshold"
                    className="w-20"
                    placeholder="0.00"
                    value={settings.shipping.free.threshold}
                    onChange={(e) => handleNestedInputChange("shipping", "free", "threshold", e.target.value)}
                  />
                  <Switch
                    id="shipping-free"
                    checked={settings.shipping.free.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange("shipping", "free", "enabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Países de envío</CardTitle>
              <CardDescription>Configura los países a los que envías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ship-spain"
                    checked={settings.shipping.countries.spain}
                    onCheckedChange={(checked) => handleNestedInputChange("shipping", "countries", "spain", checked)}
                  />
                  <Label htmlFor="ship-spain">España</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ship-eu"
                    checked={settings.shipping.countries.eu}
                    onCheckedChange={(checked) => handleNestedInputChange("shipping", "countries", "eu", checked)}
                  />
                  <Label htmlFor="ship-eu">Unión Europea</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ship-worldwide"
                    checked={settings.shipping.countries.worldwide}
                    onCheckedChange={(checked) =>
                      handleNestedInputChange("shipping", "countries", "worldwide", checked)
                    }
                  />
                  <Label htmlFor="ship-worldwide">Todo el mundo</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de pago</CardTitle>
              <CardDescription>Configura los métodos de pago disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-card"
                  checked={settings.payments.methods.card}
                  onCheckedChange={(checked) => handleNestedInputChange("payments", "methods", "card", checked)}
                />
                <Label htmlFor="payment-card">Tarjeta de crédito/débito</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-paypal"
                  checked={settings.payments.methods.paypal}
                  onCheckedChange={(checked) => handleNestedInputChange("payments", "methods", "paypal", checked)}
                />
                <Label htmlFor="payment-paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-transfer"
                  checked={settings.payments.methods.transfer}
                  onCheckedChange={(checked) => handleNestedInputChange("payments", "methods", "transfer", checked)}
                />
                <Label htmlFor="payment-transfer">Transferencia bancaria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-cod"
                  checked={settings.payments.methods.cod}
                  onCheckedChange={(checked) => handleNestedInputChange("payments", "methods", "cod", checked)}
                />
                <Label htmlFor="payment-cod">Contra reembolso</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impuestos</CardTitle>
              <CardDescription>Configura los impuestos aplicados a tus productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">IVA (%)</Label>
                <Input
                  id="tax-rate"
                  placeholder="21"
                  value={settings.payments.tax.rate}
                  onChange={(e) => handleNestedInputChange("payments", "tax", "rate", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="tax-included"
                  checked={settings.payments.tax.included}
                  onCheckedChange={(checked) => handleNestedInputChange("payments", "tax", "included", checked)}
                />
                <Label htmlFor="tax-included">Precios con impuestos incluidos</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por email</CardTitle>
              <CardDescription>Configura las notificaciones que recibes por email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-orders"
                  checked={settings.notifications.admin.orders}
                  onCheckedChange={(checked) => handleNestedInputChange("notifications", "admin", "orders", checked)}
                />
                <Label htmlFor="notify-orders">Nuevos pedidos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-stock"
                  checked={settings.notifications.admin.stock}
                  onCheckedChange={(checked) => handleNestedInputChange("notifications", "admin", "stock", checked)}
                />
                <Label htmlFor="notify-stock">Alertas de stock bajo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-returns"
                  checked={settings.notifications.admin.returns}
                  onCheckedChange={(checked) => handleNestedInputChange("notifications", "admin", "returns", checked)}
                />
                <Label htmlFor="notify-returns">Solicitudes de devolución</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-reviews"
                  checked={settings.notifications.admin.reviews}
                  onCheckedChange={(checked) => handleNestedInputChange("notifications", "admin", "reviews", checked)}
                />
                <Label htmlFor="notify-reviews">Nuevas reseñas</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones al cliente</CardTitle>
              <CardDescription>Configura las notificaciones que reciben tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="customer-order"
                  checked={settings.notifications.customer.order}
                  onCheckedChange={(checked) => handleNestedInputChange("notifications", "customer", "order", checked)}
                />
                <Label htmlFor="customer-order">Confirmación de pedido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="customer-shipping"
                  checked={settings.notifications.customer.shipping}
                  onCheckedChange={(checked) =>
                    handleNestedInputChange("notifications", "customer", "shipping", checked)
                  }
                />
                <Label htmlFor="customer-shipping">Información de envío</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="customer-delivery"
                  checked={settings.notifications.customer.delivery}
                  onCheckedChange={(checked) =>
                    handleNestedInputChange("notifications", "customer", "delivery", checked)
                  }
                />
                <Label htmlFor="customer-delivery">Confirmación de entrega</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="customer-abandoned"
                  checked={settings.notifications.customer.abandoned}
                  onCheckedChange={(checked) =>
                    handleNestedInputChange("notifications", "customer", "abandoned", checked)
                  }
                />
                <Label htmlFor="customer-abandoned">Carrito abandonado</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
