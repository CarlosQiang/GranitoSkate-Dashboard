import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductsTableActions } from "@/components/products/products-table-actions"

export function ProductsTable() {
  // Datos de ejemplo para la tabla de productos
  const products = [
    {
      id: "1",
      title: "Skateboard Completo",
      status: "ACTIVE",
      totalInventory: 15,
      featuredImage: {
        url: "/placeholder.svg?key=414vy",
      },
      priceRange: {
        minVariantPrice: {
          amount: "89.99",
          currencyCode: "USD",
        },
      },
      updatedAt: "2023-05-15T10:00:00Z",
      handle: "skateboard-completo",
    },
    {
      id: "2",
      title: "Ruedas Pro",
      status: "ACTIVE",
      totalInventory: 50,
      featuredImage: {
        url: "/placeholder.svg?key=qprv5",
      },
      priceRange: {
        minVariantPrice: {
          amount: "29.99",
          currencyCode: "USD",
        },
      },
      updatedAt: "2023-05-10T14:30:00Z",
      handle: "ruedas-pro",
    },
  ]

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Estado</TableHead>
            <TableHead className="hidden md:table-cell">Inventario</TableHead>
            <TableHead className="hidden md:table-cell">Precio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay productos
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url || "/placeholder.svg"}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="aspect-square rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/productos/${product.id}`} className="hover:underline">
                    {product.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                    {product.status === "ACTIVE" ? "Activo" : "Borrador"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{product.totalInventory} unidades</TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.priceRange
                    ? new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: product.priceRange.minVariantPrice.currencyCode,
                      }).format(Number(product.priceRange.minVariantPrice.amount))
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <ProductsTableActions product={product} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
