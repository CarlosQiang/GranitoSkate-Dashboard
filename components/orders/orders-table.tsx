import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getOrders } from "@/lib/shopify"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrdersTableActions } from "@/components/orders/orders-table-actions"

export async function OrdersTable() {
  const orders = await getOrders()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="hidden md:table-cell">Estado</TableHead>
            <TableHead className="hidden md:table-cell">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay pedidos
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/pedidos/${order.id}`} className="hover:underline">
                    {order.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {order.customer ? (
                    <Link href={`/dashboard/clientes/${order.customer.id}`} className="hover:underline">
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  ) : (
                    "Cliente eliminado"
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(order.processedAt)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={
                      order.financialStatus === "PAID"
                        ? "default"
                        : order.financialStatus === "REFUNDED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {order.financialStatus === "PAID"
                      ? "Pagado"
                      : order.financialStatus === "REFUNDED"
                        ? "Reembolsado"
                        : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
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
