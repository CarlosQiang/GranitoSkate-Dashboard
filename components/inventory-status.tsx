export function InventoryStatus({ data }: { data?: any }) {
  if (!data || typeof data !== "object") {
    return <div className="text-center text-gray-500 py-4">No hay datos de inventario disponibles</div>
  }

  const { inStock = 0, lowStock = 0, outOfStock = 0 } = data

  // resto del código del componente...
}
