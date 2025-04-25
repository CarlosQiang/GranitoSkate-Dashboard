"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrdersTableActions } from "./orders-table-actions"

export function OrdersTable({ orders = [] }) {
  const [sortConfig, setSortConfig] = useState({
    key: "processedAt",
    direction: "desc",
  })

  // Función para ordenar los pedidos
  const sortedOrders = [...orders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1
    }
    return 0
  })

  // Función para cambiar el orden
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Función para obtener el color del badge según el estado
  const getFinancialStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFulfillmentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "FULFILLED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "UNFULFILLED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
              Pedido
              {sortConfig.key === "name" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("totalPrice.amount")}>
              Total
              {sortConfig.key === "totalPrice.amount" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead>Estado de pago</TableHead>
            <TableHead>Estado de envío</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("processedAt")}>
              Fecha
              {sortConfig.key === "processedAt" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se encontraron pedidos.
              </TableCell>
            </TableRow>
          ) : (
            sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/pedidos/${order.id}`} className="hover:underline">
                    {order.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {order.customer ? (
                    <Link
                      href={`/dashboard/clientes/${order.customer.id.split("/").pop()}`}
                      className="hover:underline"
                    >
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  ) : (
                    "Cliente eliminado"
                  )}
                </TableCell>
                <TableCell>
                  {order.totalPrice
                    ? `${Number.parseFloat(order.totalPrice.amount).toFixed(2)} ${order.totalPrice.currencyCode}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge className={getFinancialStatusColor(order.financialStatus)}>
                    {order.financialStatus || "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getFulfillmentStatusColor(order.fulfillmentStatus)}>
                    {order.fulfillmentStatus || "Sin procesar"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.processedAt
                    ? formatDistanceToNow(new Date(order.processedAt), {
                        addSuffix: true,
                        locale: es,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <OrdersTableActions order={order} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
