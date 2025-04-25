import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { getCollections } from "@/lib/shopify"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CollectionsTableActions } from "@/components/collections/collections-table-actions"

export async function CollectionsTable() {
  const collections = await getCollections()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Productos</TableHead>
            <TableHead className="hidden md:table-cell">Actualizado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay colecciones
              </TableCell>
            </TableRow>
          ) : (
            collections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  {collection.image ? (
                    <Image
                      src={collection.image.url || "/placeholder.svg"}
                      alt={collection.title}
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
                  <Link href={`/dashboard/colecciones/${collection.id}`} className="hover:underline">
                    {collection.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{collection.productsCount} productos</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(collection.updatedAt)}</TableCell>
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
