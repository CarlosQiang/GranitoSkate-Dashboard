// Archivo simplificado para evitar dependencias de graphql-request
export async function fetchPromotions() {
  return { promotions: [] }
}

export async function createPromotion() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

// Añadir las funciones faltantes
export async function fetchPriceListById(id: string) {
  return {
    priceList: {
      id,
      name: "Promoción simulada",
      description: "Esta es una promoción simulada para fines de demostración",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      discountType: "percentage",
      discountValue: 15,
      status: "active",
    },
  }
}

export async function createPriceList(data: any) {
  return { success: true, message: "Función temporalmente deshabilitada", priceList: { id: "new-id" } }
}

export async function updatePriceList(id: string, data: any) {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

export async function deletePriceList(id: string) {
  return { success: true, message: "Función temporalmente deshabilitada" }
}
