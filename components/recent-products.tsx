"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

// Datos de ejemplo para los productos recientes
const mockProducts = [
  {
    id: "PROD-001",
    name: "Tabla Completa Element",
    category: "Tablas",
    price: 89.99,
    stock: 15,
    image: "/skateboard.png",
  },
  {
    id: "PROD-002",
    name: "Ruedas Spitfire Formula Four",
    category: "Ruedas",
    price: 34.5,
    stock: 28,
    image: "/various-wheels.png",
  },
  {
    id: "PROD-003",
    name: "Trucks Independent Stage 11",
    category: "Trucks",
    price: 56.75,
    stock: 12,
    image: "/various-trucks.png",
  },
  {
    id: "PROD-004",
    name: "Rodamientos Bones Reds",
    category: "Rodamientos",
    price: 22.99,
    stock: 30,
    image: "/rolling-element-bearings.png",
  },
  {
    id: "PROD-005",
    name: "Grip Mob Grip",
    category: "Accesorios",
    price: 12.5,
    stock: 45,
    image: "/hand-gripping-rock.png",
  },
]

export function RecentProducts() {
  const [products] = useState(mockProducts)

  // Función para obtener la clase de color según el stock
  const getStockClass = (stock: number) => {
    if (stock > 20) return "text-green-600"
    if (stock > 10) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No hay productos recientes</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="flex-shrink-0 mr-4">
                    <img
                      src={product.image || "/placeholder.svg?height=40&width=40"}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{formatCurrency(product.price)}</div>
                    <div className={`text-sm ${getStockClass(product.stock)}`}>{product.stock} en stock</div>
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
