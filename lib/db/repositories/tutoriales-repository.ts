import { db } from "../neon"
import { tutoriales } from "../schema"
import { eq } from "drizzle-orm"

export async function getAllTutoriales() {
  return db.select().from(tutoriales)
}

export async function getTutorialById(id: number) {
  return db.select().from(tutoriales).where(eq(tutoriales.id, id))
}

export async function getTutorialBySlug(slug: string) {
  return db.select().from(tutoriales).where(eq(tutoriales.slug, slug))
}

export async function getTutorialByShopifyId(shopifyId: string) {
  return db.select().from(tutoriales).where(eq(tutoriales.shopify_id, shopifyId))
}

export async function createTutorial(data: any) {
  return db.insert(tutoriales).values(data).returning()
}

export async function updateTutorial(id: number, data: any) {
  return db
    .update(tutoriales)
    .set({
      ...data,
      fecha_actualizacion: new Date(),
    })
    .where(eq(tutoriales.id, id))
    .returning()
}

export async function deleteTutorial(id: number) {
  return db.delete(tutoriales).where(eq(tutoriales.id, id)).returning()
}

export async function syncTutorialWithShopify(shopifyProducto: any) {
  // Extraer metadatos
  const metafields = shopifyProducto.metafields?.edges?.map((edge: any) => edge.node) || []
  const nivelDificultad =
    metafields.find((m: any) => m.namespace === "tutorial" && m.key === "nivel_dificultad")?.value || "intermedio"
  const tiempoEstimado =
    metafields.find((m: any) => m.namespace === "tutorial" && m.key === "tiempo_estimado")?.value || "0"

  // Buscar si el tutorial ya existe
  const existingTutoriales = await getTutorialByShopifyId(shopifyProducto.id)

  if (existingTutoriales.length > 0) {
    // Actualizar tutorial existente
    const tutorialId = existingTutoriales[0].id
    return updateTutorial(tutorialId, {
      titulo: shopifyProducto.title,
      descripcion: shopifyProducto.description || "",
      contenido: shopifyProducto.descriptionHtml || shopifyProducto.description || "",
      nivel_dificultad: nivelDificultad,
      tiempo_estimado: Number.parseInt(tiempoEstimado, 10) || 0,
      categorias: shopifyProducto.productType ? [shopifyProducto.productType] : [],
      tags: shopifyProducto.tags || [],
      publicado: shopifyProducto.status === "ACTIVE",
      fecha_publicacion: shopifyProducto.publishedAt ? new Date(shopifyProducto.publishedAt) : null,
      ultima_sincronizacion: new Date(),
    })
  } else {
    // Crear slug a partir del título
    const slug = shopifyProducto.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    // Crear nuevo tutorial
    return createTutorial({
      shopify_id: shopifyProducto.id,
      titulo: shopifyProducto.title,
      slug,
      descripcion: shopifyProducto.description || "",
      contenido: shopifyProducto.descriptionHtml || shopifyProducto.description || "",
      nivel_dificultad: nivelDificultad,
      tiempo_estimado: Number.parseInt(tiempoEstimado, 10) || 0,
      categorias: shopifyProducto.productType ? [shopifyProducto.productType] : [],
      tags: shopifyProducto.tags || [],
      publicado: shopifyProducto.status === "ACTIVE",
      destacado: false,
      fecha_publicacion: shopifyProducto.publishedAt ? new Date(shopifyProducto.publishedAt) : null,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      ultima_sincronizacion: new Date(),
    })
  }
}
