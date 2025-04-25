import Link from "next/link"
import { Package, ShoppingCart, Users, Tag, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getShopifyStats } from "@/lib/shopify"

export async function DashboardCards() {
  const stats = await getShopifyStats()

  const cards = [
    {
      title: "Productos",
      value: stats.productsCount,
      description: "Total de productos",
      icon: Package,
      href: "/dashboard/productos",
      color: "bg-blue-500",
    },
    {
      title: "Pedidos",
      value: stats.ordersCount,
      description: "Total de pedidos",
      icon: ShoppingCart,
      href: "/dashboard/pedidos",
      color: "bg-green-500",
    },
    {
      title: "Clientes",
      value: stats.customersCount,
      description: "Total de clientes",
      icon: Users,
      href: "/dashboard/clientes",
      color: "bg-purple-500",
    },
    {
      title: "Colecciones",
      value: stats.collectionsCount,
      description: "Total de colecciones",
      icon: Tag,
      href: "/dashboard/colecciones",
      color: "bg-amber-500",
    },
    {
      title: "Skate Spots",
      value: "6",
      description: "Spots recomendados",
      icon: MapPin,
      href: "/dashboard/skate-spots",
      color: "bg-red-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`${card.color} p-2 rounded-md text-white`}>
              <card.icon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 px-0 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href={card.href}>
                Ver detalles
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
