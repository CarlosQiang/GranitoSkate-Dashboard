import { TestShopifyPromotions } from "@/components/test-shopify-promotions"

export default function PromocionesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Promociones</h1>
      <div className="mb-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Nueva promoción
        </button>
      </div>
      <div className="mb-6">
        <TestShopifyPromotions />
      </div>
      {/* Rest of the page content */}
    </div>
  )
}
