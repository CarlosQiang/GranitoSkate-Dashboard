"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PercentIcon,
  TagIcon,
  TruckIcon,
  ShoppingBagIcon,
  UsersIcon,
  LayersIcon,
  GiftIcon,
  BadgePercentIcon,
  ClockIcon,
  StarIcon,
} from "lucide-react"

export default function MarketingPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing y Promociones</h1>
        <p className="text-muted-foreground">
          Crea y gestiona promociones para aumentar tus ventas y fidelizar a tus clientes
        </p>
      </div>

      <Tabs defaultValue="promociones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promociones">Promociones</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="promociones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PromocionCard
              title="Descuento porcentual"
              description="Aplica un descuento porcentual en productos o pedidos"
              icon={<PercentIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=PORCENTAJE_DESCUENTO")}
            />

            <PromocionCard
              title="Descuento de cantidad fija"
              description="Aplica un descuento de una cantidad fija en euros"
              icon={<TagIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=CANTIDAD_FIJA")}
            />

            <PromocionCard
              title="Envío gratuito"
              description="Ofrece envío gratuito a partir de un importe mínimo"
              icon={<TruckIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=ENVIO_GRATIS")}
            />

            <PromocionCard
              title="Compra X y lleva Y"
              description="Ofrece productos gratis por la compra de otros"
              icon={<ShoppingBagIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=COMPRA_X_LLEVA_Y")}
            />

            <PromocionCard
              title="Promoción por tiempo limitado"
              description="Crea una promoción que solo esté disponible por un tiempo limitado"
              icon={<ClockIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=PORCENTAJE_DESCUENTO&limitado=true")}
            />

            <PromocionCard
              title="Promoción para clientes VIP"
              description="Crea una promoción exclusiva para tus mejores clientes"
              icon={<StarIcon className="h-6 w-6" />}
              onClick={() => router.push("/dashboard/promociones/asistente?tipo=PORCENTAJE_DESCUENTO&vip=true")}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard/promociones")}>
              Ver todas las promociones
            </Button>
            <Button
              onClick={() => router.push("/dashboard/promociones/asistente")}
              className="bg-granito hover:bg-granito-dark"
            >
              Crear promoción personalizada
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlantillaCard
              title="Descuento de bienvenida"
              description="10% de descuento en el primer pedido"
              icon={<UsersIcon className="h-6 w-6" />}
              tags={["Nuevos clientes", "Código"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/bienvenida")}
            />

            <PlantillaCard
              title="Venta flash"
              description="25% de descuento durante 24 horas"
              icon={<ClockIcon className="h-6 w-6" />}
              tags={["Tiempo limitado", "Alto impacto"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/flash")}
            />

            <PlantillaCard
              title="Compra 2 y lleva 3"
              description="Llévate 3 productos pagando solo 2"
              icon={<LayersIcon className="h-6 w-6" />}
              tags={["Volumen", "Liquidación"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/2x3")}
            />

            <PlantillaCard
              title="Envío gratis"
              description="Envío gratis en pedidos superiores a 50€"
              icon={<TruckIcon className="h-6 w-6" />}
              tags={["Envío", "Valor mínimo"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/envio-gratis")}
            />

            <PlantillaCard
              title="Regalo sorpresa"
              description="Regalo sorpresa en pedidos superiores a 100€"
              icon={<GiftIcon className="h-6 w-6" />}
              tags={["Regalo", "Valor mínimo"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/regalo")}
            />

            <PlantillaCard
              title="Descuento por temporada"
              description="20% de descuento en productos de temporada"
              icon={<BadgePercentIcon className="h-6 w-6" />}
              tags={["Temporada", "Colección"]}
              onClick={() => router.push("/dashboard/promociones/plantillas/temporada")}
            />
          </div>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de promociones</CardTitle>
              <CardDescription>
                Analiza el rendimiento de tus promociones para optimizar tus estrategias de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Las estadísticas de promociones estarán disponibles próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface PromocionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function PromocionCard({ title, description, icon, onClick }: PromocionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-granito-light/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-granito-light/20 p-2">{icon}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" onClick={onClick}>
          Crear
        </Button>
      </CardFooter>
    </Card>
  )
}

interface PlantillaCardProps {
  title: string
  description: string
  icon: React.ReactNode
  tags: string[]
  onClick: () => void
}

function PlantillaCard({ title, description, icon, tags, onClick }: PlantillaCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-granito-light/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-granito-light/20 p-2">{icon}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-granito-light/20 px-2 py-1 text-xs">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" onClick={onClick}>
          Usar plantilla
        </Button>
      </CardFooter>
    </Card>
  )
}
