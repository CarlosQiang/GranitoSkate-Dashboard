"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomersTableActions } from "./customers-table-actions"

export function CustomersTable({ customers = [] }) {
  const router = useRouter()
  const [sortConfig, setSortConfig] = useState({
    key: "updatedAt",
    direction: "desc",
  })

  // Función para ordenar los clientes
  const sortedCustomers = [...customers].sort((a, b) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort("firstName")}>
              Nombre
              {sortConfig.key === "firstName" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
              Email
              {sortConfig.key === "email" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("updatedAt")}>
              Actualizado
              {sortConfig.key === "updatedAt" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          ) : (
            sortedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/clientes/${customer.id}`} className="hover:underline">
                    {customer.firstName} {customer.lastName}
                  </Link>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "N/A"}</TableCell>
                <TableCell>
                  {customer.updatedAt
                    ? formatDistanceToNow(new Date(customer.updatedAt), {
                        addSuffix: true,
                        locale: es,
                      })
                    : "N/A"}
                </TableCell>
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
