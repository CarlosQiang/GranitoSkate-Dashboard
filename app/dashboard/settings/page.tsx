"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Configuración guardada",
        description: "La configuración ha sido guardada correctamente",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Gestiona la configuración de tu tienda</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
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
                <Input id="store-name" placeholder="Nombre de tu tienda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Email de contacto</Label>
                <Input id="store-email" type="email" placeholder="email@tutienda.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Teléfono</Label>
                <Input id="store-phone" type="tel" placeholder="+34 XXX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Dirección</Label>
                <Textarea id="store-address" placeholder="Dirección de tu tienda" />
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
                  <Input id="shipping-standard-price" className="w-20" placeholder="0.00" />
                  <Switch id="shipping-standard" />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="shipping-express">Envío express</Label>
                  <p className="text-sm text-muted-foreground">1-2 días laborables</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input id="shipping-express-price" className="w-20" placeholder="0.00" />
                  <Switch id="shipping-express" />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="shipping-free">Envío gratuito</Label>
                  <p className="text-sm text-muted-foreground">Para pedidos superiores a</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input id="shipping-free-threshold" className="w-20" placeholder="0.00" />
                  <Switch id="shipping-free" />
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
                  <Switch id="ship-spain" />
                  <Label htmlFor="ship-spain">España</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ship-eu" />
                  <Label htmlFor="ship-eu">Unión Europea</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ship-worldwide" />
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
                <Switch id="payment-card" />
                <Label htmlFor="payment-card">Tarjeta de crédito/débito</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="payment-paypal" />
                <Label htmlFor="payment-paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="payment-transfer" />
                <Label htmlFor="payment-transfer">Transferencia bancaria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="payment-cod" />
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
                <Input id="tax-rate" placeholder="21" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="tax-included" />
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
                <Switch id="notify-orders" />
                <Label htmlFor="notify-orders">Nuevos pedidos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-stock" />
                <Label htmlFor="notify-stock">Alertas de stock bajo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-returns" />
                <Label htmlFor="notify-returns">Solicitudes de devolución</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notify-reviews" />
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
                <Switch id="customer-order" />
                <Label htmlFor="customer-order">Confirmación de pedido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="customer-shipping" />
                <Label htmlFor="customer-shipping">Información de envío</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="customer-delivery" />
                <Label htmlFor="customer-delivery">Confirmación de entrega</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="customer-abandoned" />
                <Label htmlFor="customer-abandoned">Carrito abandonado</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
