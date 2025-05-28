"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"

interface DashboardStatsProps {
  data?: {
    totalSales?: number
    totalOrders?: number
    totalCustomers?: number
    totalProducts?: number
    salesGrowth?: number
    ordersGrowth?: number
    customersGrowth?: number
    productsGrowth?: number
  }
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: "Ventas Totales",
      value: data?.totalSales ? `€${data.totalSales.toLocaleString()}` : "€0,00",
      change: data?.salesGrowth || 0,
      icon: DollarSign,
    },
    {
      title: "Pedidos",
      value: data?.totalOrders?.toString() || "0",
      change: data?.ordersGrowth || 0,
      icon: ShoppingCart,
    },
    {
      title: "Clientes",
      value: data?.totalCustomers?.toString() || "0",
      change: data?.customersGrowth || 0,
      icon: Users,
    },
    {
      title: "Productos",
      value: data?.totalProducts?.toString() || "0",
      change: data?.productsGrowth || 0,
      icon: Package,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.change >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? "text-green-600" : "text-red-600"}`} />
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? "+" : ""}
                  {stat.change}%
                </span>
                <span className="ml-1">desde el mes pasado</span>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
