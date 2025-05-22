import type { Metadata } from "next"
import ProductsList from "@/components/products-list"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Productos | GestionGranito",
  description: "Gestiona los productos de tu tienda Shopify",
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos de tu tienda Shopify</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/api/sync/productos" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar productos
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/products/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      <ProductsList />
    </div>
  )
}
