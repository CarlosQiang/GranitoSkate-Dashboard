import { TestPromotionsConnection } from "@/components/test-promotions-connection"

export default function PromocionesPage() {
  return (
    <div>
      <h1>Promociones</h1>

      {/* Componente de diagnóstico */}
      <TestPromotionsConnection />

      <p>Contenido principal de la página de promociones.</p>
    </div>
  )
}
