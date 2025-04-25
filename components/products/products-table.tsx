import Link from "next/link"
import Image from "next/image"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getProducts } from "@/lib/shopify"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductsTableActions } from "@/components/products/products-table-actions"

export async function ProductsTable() {
  const products = await getProducts()

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
            <TableHead className="hidden md:table-cell">Actualizado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
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
                    ? formatCurrency(
                        product.priceRange.minVariantPrice.amount,
                        product.priceRange.minVariantPrice.currencyCode,
                      )
                    : "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(product.updatedAt)}</TableCell>
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
