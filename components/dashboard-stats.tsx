"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Users, ShoppingBag, CreditCard, Package } from "lucide-react"

// Datos de ejemplo para las estadísticas
const stats = [
  {
    title: "Ventas Totales",
    value: 4250.75,
    change: 12.5,
    icon: CreditCard,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    title: "Pedidos",
    value: 42,
    change: 8.2,
    icon: ShoppingBag,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    title: "Clientes",
    value: 156,
    change: 5.3,
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "Productos",
    value: 89,
    change: -2.4,
    icon: Package,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {typeof stat.value === "number" && stat.title.includes("Ventas")
                    ? formatCurrency(stat.value)
                    : stat.value}
                </h3>
                <div className="flex items-center mt-1">
                  {stat.change > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">+{stat.change}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">{stat.change}%</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">vs. mes anterior</span>
                </div>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
