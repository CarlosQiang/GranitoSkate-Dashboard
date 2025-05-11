export type PromotionStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "UNKNOWN"

export interface Promotion {
  id: string
  title: string
  summary: string
  startsAt: string
  endsAt?: string
  status: PromotionStatus
  target: string
  valueType: string
  value: number
  usageLimit?: number
  usageCount: number
  code?: string
  createdAt: string
  updatedAt: string
  error?: string
}

/**
 * Obtiene todas las promociones
 * @returns Lista de promociones
 */
export async function fetchPromotions(): Promise<Promotion[]> {
  try {
    // Implementación simplificada
    return [
      {
        id: "gid://shopify/PriceRule/1",
        title: "Descuento de verano",
        summary: "20% de descuento en todos los productos",
        startsAt: "2023-06-01T00:00:00Z",
        endsAt: "2023-08-31T23:59:59Z",
        status: "ACTIVE" as PromotionStatus,
        target: "ALL",
        valueType: "percentage",
        value: 20,
        usageLimit: 100,
        usageCount: 45,
        code: "VERANO20",
        createdAt: "2023-05-15T10:00:00Z",
        updatedAt: "2023-05-15T10:00:00Z",
      },
      {
        id: "gid://shopify/PriceRule/2",
        title: "Envío gratis",
        summary: "Envío gratis en compras superiores a 50€",
        startsAt: "2023-01-01T00:00:00Z",
        endsAt: null,
        status: "ACTIVE" as PromotionStatus,
        target: "SHIPPING_LINE",
        valueType: "fixed_amount",
        value: 0,
        usageLimit: null,
        usageCount: 120,
        code: "ENVIOGRATIS",
        createdAt: "2022-12-20T09:30:00Z",
        updatedAt: "2022-12-20T09:30:00Z",
      },
    ]
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción
 */
export async function fetchPromotionById(id: string): Promise<Promotion | null> {
  try {
    // Implementación simplificada
    return {
      id: `gid://shopify/PriceRule/${id}`,
      title: "Descuento de ejemplo",
      summary: "10% de descuento en todos los productos",
      startsAt: "2023-01-01T00:00:00Z",
      endsAt: null,
      status: "ACTIVE" as PromotionStatus,
      target: "ALL",
      valueType: "percentage",
      value: 10,
      usageLimit: null,
      usageCount: 50,
      code: "EJEMPLO10",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    }
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error)
    return null
  }
}

/**
 * Crea una nueva promoción
 * @param data Datos de la promoción
 * @returns La promoción creada
 */
export async function createPriceList(data: any): Promise<any> {
  try {
    // Implementación simplificada
    console.log("Creating promotion with data:", data)
    return {
      id: `gid://shopify/PriceRule/${Date.now()}`,
      ...data,
    }
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw new Error(`Error creating promotion: ${error.message}`)
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param data Datos a actualizar
 * @returns La promoción actualizada
 */
export async function updatePriceList(id: string, data: any): Promise<any> {
  try {
    // Implementación simplificada
    console.log(`Updating promotion ${id} with data:`, data)
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error)
    throw new Error(`Error updating promotion: ${error.message}`)
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns true si se eliminó correctamente
 */
export async function deletePriceList(id: string): Promise<boolean> {
  try {
    // Implementación simplificada
    console.log(`Deleting promotion ${id}`)
    return true
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error)
    throw new Error(`Error deleting promotion: ${error.message}`)
  }
}
