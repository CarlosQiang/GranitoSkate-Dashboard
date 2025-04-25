import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { getCustomers } from "@/lib/shopify"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomersTableActions } from "@/components/customers/customers-table-actions"

export async function CustomersTable() {
  const customers = await getCustomers()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
            <TableHead className="hidden md:table-cell">Pedidos</TableHead>
            <TableHead className="hidden md:table-cell">Registrado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay clientes
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/clientes/${customer.id}`} className="hover:underline">
                    {customer.firstName} {customer.lastName}
                  </Link>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.phone || "N/A"}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.ordersCount}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(customer.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <CustomersTableActions customer={customer} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
