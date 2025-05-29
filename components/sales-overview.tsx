export function SalesOverview({ data }: { data?: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-gray-500">No hay datos de ventas disponibles</div>
  }

  // resto del código del componente...
}
