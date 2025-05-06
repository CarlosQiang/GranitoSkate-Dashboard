import { Suspense } from "react"
import CustomersList from "@/components/customers-list"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@radix-ui/react-icons"
import Link from "next/link"

export const metadata = {
  title: "Clientes | GranitoSkate Dashboard",
  description: "Gestiona los clientes de tu tienda",
}

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona los clientes de tu tienda</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </Link>
      </div>

      <ShopifyConnectionStatus />

      <Suspense fallback={<div>Cargando clientes...</div>}>
        <CustomersList />
      </Suspense>
    </div>
  )
}
