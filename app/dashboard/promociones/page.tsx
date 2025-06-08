import { SyncPromotionsOnly } from "@/components/sync-promotions-only"

export default function PromocionesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Promociones</h1>
      <p className="mb-4">Aquí podrás gestionar las promociones de la aplicación.</p>

      {/* Reemplazo Completo de Promociones */}
      <div className="mt-8">
        <SyncPromotionsOnly onSyncComplete={() => window.location.reload()} />
      </div>
    </div>
  )
}
