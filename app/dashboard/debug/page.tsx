import { EnvDebugger } from "@/components/env-debugger"
import { ShopifyConnectionTester } from "@/components/shopify-connection-tester"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Herramientas de Depuración</h1>
      <div className="space-y-8">
        <EnvDebugger />
        <ShopifyConnectionTester />
      </div>
    </div>
  )
}
