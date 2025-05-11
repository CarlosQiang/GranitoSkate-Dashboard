import { ShopifyDiagnostics } from "@/components/shopify-diagnostics"

export default function ShopifyDiagnosticsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Shopify</h1>
      <ShopifyDiagnostics />
    </div>
  )
}
