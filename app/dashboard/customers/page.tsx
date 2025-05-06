import type { Metadata } from "next"
import { CustomersList } from "@/components/customers-list"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"

export const metadata: Metadata = {
  title: "Clientes | GestionGranito",
  description: "Gestiona los clientes de tu tienda Shopify",
}

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <ShopifyConnectionStatus />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>
      </div>

      <CustomersList />
    </div>
  )
}
