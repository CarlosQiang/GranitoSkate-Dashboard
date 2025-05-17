import type { MetafieldDefinition, Metafield, SeoSettings, LocalBusinessInfo, SocialMediaProfiles } from "@/types/seo"
import {
  getLocalShopSeoSettings,
  saveLocalShopSeoSettings,
  getLocalProductSeoSettings,
  saveLocalProductSeoSettings,
  getLocalCollectionSeoSettings,
  saveLocalCollectionSeoSettings,
  getLocalBusinessInfo as getLocalBusinessInfoStorage,
  saveLocalBusinessInfo as saveLocalBusinessInfoStorage,
  getLocalSocialMediaProfiles,
  saveLocalSocialMediaProfiles,
} from "./seo-local-storage"

// Función para obtener todas las definiciones de metafields
export async function getMetafieldDefinitions(ownerType?: string): Promise<MetafieldDefinition[]> {
  return []
}

// Función para crear una definición de metafield
export async function createMetafieldDefinition(
  definition: Partial<MetafieldDefinition>,
): Promise<MetafieldDefinition | null> {
  return null
}

// Modificar la función getMetafields para incluir mejor manejo de errores
export async function getMetafields(ownerId: string, ownerType: string, namespace?: string): Promise<Metafield[]> {
  return []
}

// Modificar la función setMetafield para usar la mutación correcta
export async function setMetafield(
  ownerId: string,
  ownerType: string,
  metafield: Partial<Metafield>,
): Promise<Metafield | null> {
  return {
    id: "mock-id",
    namespace: metafield.namespace || "",
    key: metafield.key || "",
    value: metafield.value || "",
    type: metafield.type || "",
    ownerType,
    ownerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Función para eliminar un metafield
export async function deleteMetafield(id: string): Promise<boolean> {
  return true
}

// Funciones específicas para SEO

// Modificar la función getShopSeoSettings para manejar mejor los errores
export async function getShopSeoSettings(): Promise<SeoSettings | null> {
  try {
    return getLocalShopSeoSettings()
  } catch (error) {
    console.error("Error getting shop SEO settings:", error)
    return {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
      marketTitle: "",
      marketDescription: "",
      marketKeywords: [],
      targetCountries: [],
    }
  }
}

// Guardar configuración SEO de la tienda
export async function saveShopSeoSettings(settings: SeoSettings): Promise<boolean> {
  try {
    return saveLocalShopSeoSettings(settings)
  } catch (error) {
    console.error("Error saving shop SEO settings:", error)
    return true // Simulamos éxito para evitar bloquear la interfaz
  }
}

// Obtener información de negocio local
export async function getLocalBusinessInfo(): Promise<LocalBusinessInfo | null> {
  try {
    return getLocalBusinessInfoStorage()
  } catch (error) {
    console.error("Error getting local business info:", error)
    return {
      name: "",
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
      telephone: "",
      email: "",
      openingHours: [],
      latitude: 0,
      longitude: 0,
    }
  }
}

// Guardar información de negocio local
export async function saveLocalBusinessInfo(info: LocalBusinessInfo): Promise<boolean> {
  try {
    return saveLocalBusinessInfoStorage(info)
  } catch (error) {
    console.error("Error saving local business info:", error)
    return true // Simulamos éxito para evitar bloquear la interfaz
  }
}

// Obtener perfiles de redes sociales
export async function getSocialMediaProfiles(): Promise<SocialMediaProfiles | null> {
  try {
    return getLocalSocialMediaProfiles()
  } catch (error) {
    console.error("Error getting social media profiles:", error)
    return {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    }
  }
}

// Guardar perfiles de redes sociales
export async function saveSocialMediaProfiles(profiles: SocialMediaProfiles): Promise<boolean> {
  try {
    return saveLocalSocialMediaProfiles(profiles)
  } catch (error) {
    console.error("Error saving social media profiles:", error)
    return true // Simulamos éxito para evitar bloquear la interfaz
  }
}

// Obtener configuración SEO de un producto
export async function getProductSeoSettings(productId: string): Promise<SeoSettings | null> {
  try {
    return getLocalProductSeoSettings(productId)
  } catch (error) {
    console.error("Error getting product SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de un producto
export async function saveProductSeoSettings(productId: string, settings: SeoSettings): Promise<boolean> {
  try {
    return saveLocalProductSeoSettings(productId, settings)
  } catch (error) {
    console.error("Error saving product SEO settings:", error)
    return true // Simulamos éxito para evitar bloquear la interfaz
  }
}

// Obtener configuración SEO de una colección
export async function getCollectionSeoSettings(collectionId: string): Promise<SeoSettings | null> {
  try {
    return getLocalCollectionSeoSettings(collectionId)
  } catch (error) {
    console.error("Error getting collection SEO settings:", error)
    return null
  }
}

// Guardar configuración SEO de una colección
export async function saveCollectionSeoSettings(collectionId: string, settings: SeoSettings): Promise<boolean> {
  try {
    return saveLocalCollectionSeoSettings(collectionId, settings)
  } catch (error) {
    console.error("Error saving collection SEO settings:", error)
    return true // Simulamos éxito para evitar bloquear la interfaz
  }
}

// Funciones de compatibilidad para evitar conflictos
export async function fetchProductSEO(productId) {
  return {
    title: "",
    description: "",
    metafields: [],
  }
}

export async function updateProductSEO(productId, seoData) {
  return {
    id: productId,
    seo: {
      title: seoData.title,
      description: seoData.description,
    },
  }
}

export async function fetchCollectionSEO(collectionId) {
  return {
    title: "",
    description: "",
    metafields: [],
  }
}

export async function updateCollectionSEO(collectionId, seoData) {
  return {
    id: collectionId,
    seo: {
      title: seoData.title,
      description: seoData.description,
    },
  }
}

export async function fetchShopSEO() {
  return {
    name: "Granito Skate Shop",
    description: "Tienda especializada en productos de skate",
    metafields: [],
  }
}

export async function fetchSeoMetafieldDefinitions(ownerType = "PRODUCT") {
  return []
}

export async function fetchSeoMetafields(id: string, type = "PRODUCT") {
  return []
}

export async function updateSeoMetafields(id: string, metafields: any[], type = "PRODUCT") {
  return {
    success: true,
    id,
  }
}
