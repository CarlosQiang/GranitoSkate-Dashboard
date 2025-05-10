"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Search, UserPlus, Edit, Trash, Eye } from "lucide-react" // Cambiado de @radix-ui/react-icons a lucide-react

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Resto del código se mantiene igual...

export function CustomersList({ customers = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  })

  const sortedCustomers = useMemo(() => {
    const sortableCustomers = [...customers]
    if (sortConfig !== null) {
      sortableCustomers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableCustomers
  }, [customers, sortConfig])

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Resto del código se mantiene igual...

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      {/* Resto del código se mantiene igual, cambiando los iconos por los equivalentes de Lucide */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort("name")} className="cursor-pointer">
              Nombre
              {sortConfig.key === "name" &&
                (sortConfig.direction === "ascending" ? (
                  <ChevronUp className="inline ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="inline ml-1 h-4 w-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => requestSort("email")} className="cursor-pointer">
              Email
              {sortConfig.key === "email" &&
                (sortConfig.direction === "ascending" ? (
                  <ChevronUp className="inline ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="inline ml-1 h-4 w-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => requestSort("orders")} className="cursor-pointer text-right">
              Pedidos
              {sortConfig.key === "orders" &&
                (sortConfig.direction === "ascending" ? (
                  <ChevronUp className="inline ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="inline ml-1 h-4 w-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => requestSort("totalSpent")} className="cursor-pointer text-right">
              Total Gastado
              {sortConfig.key === "totalSpent" &&
                (sortConfig.direction === "ascending" ? (
                  <ChevronUp className="inline ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="inline ml-1 h-4 w-4" />
                ))}
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell className="text-right">{customer.orders}</TableCell>
              <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/customers/${customer.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
