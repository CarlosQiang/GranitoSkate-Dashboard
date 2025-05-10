"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"

// Datos de ejemplo para los pedidos recientes
const mockOrders = [
  {
    id: "ORD-001",
    customer: "Juan Pérez",
    date: "2023-10-15",
    status: "completed",
    total: 89.99,
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "María García",
    date: "2023-10-14",
    status: "processing",
    total: 124.5,
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Carlos Rodríguez",
    date: "2023-10-13",
    status: "completed",
    total: 56.75,
    items: 1,
  },
  {
    id: "ORD-004",
    customer: "Ana Martínez",
    date: "2023-10-12",
    status: "shipped",
    total: 210.25,
    items: 4,
  },
  {
    id: "ORD-005",
    customer: "Pedro Sánchez",
    date: "2023-10-11",
    status: "completed",
    total: 45.0,
    items: 1,
  },
]

export function RecentOrders() {
  const [orders] = useState(mockOrders)

  // Función para obtener la clase de color según el estado
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No hay pedidos recientes</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b">
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-gray-500">{order.customer}</div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status === "completed"
                        ? "Completado"
                        : order.status === "processing"
                          ? "Procesando"
                          : order.status === "shipped"
                            ? "Enviado"
                            : order.status === "cancelled"
                              ? "Cancelado"
                              : order.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col sm:flex-row justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Fecha</span>
                    <span>{formatDate(new Date(order.date))}</span>
                  </div>
                  <div className="flex flex-col mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500">Productos</span>
                    <span>
                      {order.items} {order.items === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                  <div className="flex flex-col mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
