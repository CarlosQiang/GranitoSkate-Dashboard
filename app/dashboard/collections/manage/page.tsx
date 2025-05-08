import { CollectionProductManager } from "@/components/collection-product-manager"

export default function ManageCollectionsPage() {
  // Datos de ejemplo
  const collectionId = "example-collection-id"
  const products = [
    {
      id: "product1",
      title: "Tabla de skate Pro",
      productType: "Tablas",
      image: { url: "/skateboard.png" },
    },
    {
      id: "product2",
      title: "Ruedas de alta velocidad",
      productType: "Ruedas",
      image: { url: "/skateboard-wheels.png" },
    },
    {
      id: "product3",
      title: "Ejes de aluminio",
      productType: "Ejes",
      image: { url: "/skateboard-trucks.png" },
    },
  ]

  const collectionProducts = [
    {
      id: "product4",
      title: "Camiseta GranitoSkate",
      productType: "Ropa",
      image: { url: "/placeholder.svg?key=sseiq" },
    },
    {
      id: "product5",
      title: "Zapatillas de skate",
      productType: "Calzado",
      image: { url: "/skateboard-shoes.png" },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestionar Colección</h1>
          <p className="text-muted-foreground">Añade o elimina productos de la colección</p>
        </div>
      </div>

      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Funcionalidad en mantenimiento</h2>
        <p className="text-yellow-700">
          Esta página muestra datos de ejemplo. La funcionalidad completa estará disponible próximamente.
        </p>
      </div>

      <CollectionProductManager
        collectionId={collectionId}
        products={products}
        collectionProducts={collectionProducts}
      />
    </div>
  )
}
