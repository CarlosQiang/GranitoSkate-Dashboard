import type { Metadata } from "next"
import ProductsPageClient from "./ProductsPageClient"

export const metadata: Metadata = {
  title: "Productos | GestionGranito",
  description: "Gestiona los productos de tu tienda Shopify",
}

export default function ProductsPage() {
  return <ProductsPageClient />
}
