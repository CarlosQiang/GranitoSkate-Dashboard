"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface RecentOrdersProps {
  data?: Array<{
    id: string
    name: string
    processedAt?: string
    total: string
    currency?: string
    customer?: string
    items?: Array<{
      title: string
      quantity: number
    }>
  }>
}

export function RecentOrders({ data = [] }: RecentOrdersProps) {
  // Verificar si hay datos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No hay pedidos recientes</p>
      </div>
    )
  }

  console.log("Mostrando pedidos recientes:", data.length)

  return (
    <div className="space-y-4">
      {data.map((order) => (
        <Card key={order.id} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.name}</p>
                <p className="text-xs text-muted-foreground">{order.customer || "Cliente"}</p>
                {order.processedAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.processedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {Number.parseFloat(order.total).toFixed(2)} {order.currency || "€"}
                </p>
                {order.items && (
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
