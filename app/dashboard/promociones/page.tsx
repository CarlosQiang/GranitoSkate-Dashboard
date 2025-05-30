import { SyncPromotionsOnly } from "@/components/sync-promotions-only"

export default function PromocionesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Promociones</h1>
      <p>Aquí podrás gestionar las promociones de tu tienda.</p>

      {/* Componente de reemplazo de promociones al final */}
      <div className="mt-8">
        <SyncPromotionsOnly onSyncComplete={() => {}} />
      </div>
    </div>
  )
}
