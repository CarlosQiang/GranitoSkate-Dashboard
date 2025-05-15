import { SyncDashboard } from "@/components/sync-dashboard"

export const metadata = {
  title: "Sincronización con Shopify",
  description: "Sincroniza tus datos entre Shopify y la base de datos local",
}

export default function SyncPage() {
  return (
    <div className="container mx-auto py-10">
      <SyncDashboard />
    </div>
  )
}
