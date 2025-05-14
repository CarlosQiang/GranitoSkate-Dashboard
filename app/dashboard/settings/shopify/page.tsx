import { ShopifyCredentialsForm } from "@/components/shopify-credentials-form"

export default function ShopifySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Shopify</h1>
        <p className="text-muted-foreground">Gestiona la conexión con tu tienda Shopify</p>
      </div>

      <ShopifyCredentialsForm />
    </div>
  )
}
