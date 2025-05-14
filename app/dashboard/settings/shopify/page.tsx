import { ShopifySetup } from "@/components/shopify-setup"

export default function ShopifySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Shopify</h1>
        <p className="text-muted-foreground">Configura la conexión con tu tienda Shopify</p>
      </div>

      <ShopifySetup />
    </div>
  )
}
