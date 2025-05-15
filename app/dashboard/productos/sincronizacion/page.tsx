import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductSyncButton } from "@/components/product-sync-button"

export default function ProductSyncPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/productos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sincronización de Productos</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Esta página te permite sincronizar los productos de tu tienda Shopify con la base de datos local.
      </p>

      <ProductSyncButton />

      <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800">Información sobre la sincronización</h2>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">¿Qué hace la sincronización?</h3>
          <p className="text-blue-600">
            La sincronización obtiene los productos de Shopify y los guarda en la base de datos local. Esto incluye:
          </p>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Información básica del producto (título, descripción, etc.)</li>
            <li>Variantes del producto con sus precios e inventario</li>
            <li>Imágenes del producto</li>
            <li>Metadatos y SEO</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">¿Cuándo debo sincronizar?</h3>
          <p className="text-blue-600">Se recomienda sincronizar los productos cuando:</p>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Inicias la aplicación por primera vez</li>
            <li>Has realizado cambios importantes en los productos de Shopify</li>
            <li>Notas que los datos en la aplicación no coinciden con los de Shopify</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
