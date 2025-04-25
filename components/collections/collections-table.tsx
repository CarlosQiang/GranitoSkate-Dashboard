"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CollectionsTableActions } from "./collections-table-actions"

export function CollectionsTable({ collections = [] }) {
  const [sortConfig, setSortConfig] = useState({
    key: "updatedAt",
    direction: "desc",
  })

  // Función para ordenar las colecciones
  const sortedCollections = [...collections].sort((a, b) => {
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
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("title")}>
              Título
              {sortConfig.key === "title" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("productsCount")}>
              Productos
              {sortConfig.key === "productsCount" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("updatedAt")}>
              Actualizada
              {sortConfig.key === "updatedAt" && <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>}
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCollections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No se encontraron colecciones.
              </TableCell>
            </TableRow>
          ) : (
            sortedCollections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  {collection.image ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={collection.image.url || "/placeholder.svg"}
                        alt={collection.image.altText || collection.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                      <span className="text-xs text-gray-500">N/A</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/colecciones/${collection.id}`} className="hover:underline">
                    {collection.title}
                  </Link>
                </TableCell>
                <TableCell>{collection.productsCount}</TableCell>
                <TableCell>
                  {collection.updatedAt
                    ? formatDistanceToNow(new Date(collection.updatedAt), {
                        addSuffix: true,
                        locale: es,
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <CollectionsTableActions collection={collection} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
