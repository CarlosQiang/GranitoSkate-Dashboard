// lib/api/products.ts

// Asegurarse de que el estado del producto se normalice correctamente
const normalizeProductStatus = (status) => {
  if (!status) return "ACTIVE" // Por defecto, considerar productos como activos

  // Normalizar el estado a mayúsculas
  const normalizedStatus = status.toUpperCase()

  // Validar que sea uno de los estados válidos
  if (["ACTIVE", "DRAFT", "ARCHIVED"].includes(normalizedStatus)) {
    return normalizedStatus
  }

  return "ACTIVE" // Si no es un estado válido, considerarlo activo
}

// Mock function to simulate fetching products from an API
export const fetchProducts = async () => {
  // Simulate API response
  const mockProducts = [
    { id: "1", name: "Product A", price: 20, status: "active" },
    { id: "2", name: "Product B", price: 30, status: "draft" },
    { id: "3", name: "Product C", price: 40, status: "archived" },
    { id: "4", name: "Product D", price: 50, status: null },
    { id: "5", name: "Product E", price: 60, status: "invalid" },
  ]

  // Asegurarse de que cada producto tenga un estado normalizado
  const products = mockProducts.map((product) => ({
    ...product,
    status: normalizeProductStatus(product.status),
  }))

  return products
}
