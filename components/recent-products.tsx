export function RecentProducts({ data }: { data?: any[] }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="text-center text-gray-500 py-4">No hay productos recientes</div>
  }

  // resto del código del componente...
}
