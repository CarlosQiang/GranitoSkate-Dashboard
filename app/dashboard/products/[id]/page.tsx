export default function ProductDetailPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle de Producto</h1>
          <p className="text-muted-foreground">Esta funcionalidad está temporalmente deshabilitada</p>
        </div>
      </div>

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Funcionalidad en mantenimiento</h2>
        <p className="text-yellow-700">
          La visualización de detalles de productos está temporalmente deshabilitada mientras actualizamos nuestro
          sistema. Por favor, inténtelo de nuevo más tarde.
        </p>
      </div>
    </div>
  )
}
