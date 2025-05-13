import { db } from "../neon"
import { promociones } from "../schema"
import { eq } from "drizzle-orm"

export async function getAllPromociones() {
  return db.select().from(promociones)
}

export async function getPromocionById(id: number) {
  return db.select().from(promociones).where(eq(promociones.id, id))
}

export async function getPromocionByShopifyId(shopifyId: string) {
  return db.select().from(promociones).where(eq(promociones.shopify_id, shopifyId))
}

export async function createPromocion(data: any) {
  return db.insert(promociones).values(data).returning()
}

export async function updatePromocion(id: number, data: any) {
  return db
    .update(promociones)
    .set({
      ...data,
      fecha_actualizacion: new Date(),
    })
    .where(eq(promociones.id, id))
    .returning()
}

export async function deletePromocion(id: number) {
  return db.delete(promociones).where(eq(promociones.id, id)).returning()
}

export async function syncPromocionWithShopify(shopifyPromocion: any) {
  // Buscar si la promoción ya existe
  const existingPromociones = await getPromocionByShopifyId(shopifyPromocion.id)

  if (existingPromociones.length > 0) {
    // Actualizar promoción existente
    const promocionId = existingPromociones[0].id
    return updatePromocion(promocionId, {
      titulo: shopifyPromocion.title,
      descripcion: shopifyPromocion.summary,
      tipo: shopifyPromocion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
      valor: shopifyPromocion.value,
      codigo: shopifyPromocion.code,
      objetivo: shopifyPromocion.target || "CART",
      objetivo_id: shopifyPromocion.targetId,
      fecha_inicio: shopifyPromocion.startsAt ? new Date(shopifyPromocion.startsAt) : null,
      fecha_fin: shopifyPromocion.endsAt ? new Date(shopifyPromocion.endsAt) : null,
      activa: shopifyPromocion.status === "ACTIVE",
      limite_uso: shopifyPromocion.usageLimit,
      contador_uso: shopifyPromocion.usageCount || 0,
      es_automatica: shopifyPromocion.isAutomatic || false,
      ultima_sincronizacion: new Date(),
    })
  } else {
    // Crear nueva promoción
    return createPromocion({
      shopify_id: shopifyPromocion.id,
      titulo: shopifyPromocion.title,
      descripcion: shopifyPromocion.summary,
      tipo: shopifyPromocion.valueType === "percentage" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
      valor: shopifyPromocion.value,
      codigo: shopifyPromocion.code,
      objetivo: shopifyPromocion.target || "CART",
      objetivo_id: shopifyPromocion.targetId,
      fecha_inicio: shopifyPromocion.startsAt ? new Date(shopifyPromocion.startsAt) : null,
      fecha_fin: shopifyPromocion.endsAt ? new Date(shopifyPromocion.endsAt) : null,
      activa: shopifyPromocion.status === "ACTIVE",
      limite_uso: shopifyPromocion.usageLimit,
      contador_uso: shopifyPromocion.usageCount || 0,
      es_automatica: shopifyPromocion.isAutomatic || false,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      ultima_sincronizacion: new Date(),
    })
  }
}
