import { SeoSettings, LocalBusinessInfo, SocialMediaProfiles } from "@/types/seo"

// Claves para el almacenamiento local
const KEYS = {
  SHOP_SEO: "shop_seo_settings",
  PRODUCT_SEO: "product_seo_settings_",
  COLLECTION_SEO: "collection_seo_settings_",
  LOCAL_BUSINESS: "local_business_info",
  SOCIAL_MEDIA: "social_media_profiles",
}

// Función para guardar datos en localStorage (solo en el cliente)
const saveToStorage = (key: string, data: any): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error)
    }
  }
}

// Función para obtener datos de localStorage (solo en el cliente)
const getFromStorage = <T>(key: string, defaultValue: T): T => {\
  if (typeof window !== "undefined") {\
    try {\
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting from localStorage: ${key}`, error)\
      return defaultValue
    }
  }
  return defaultValue
}

// Funciones para SEO de la tienda
export const getLocalShopSeoSettings = (): SeoSettings => {\
  const defaultSettings: SeoSettings = {\
    title: "Granito Skate Shop - Tienda de skate online",
    description: "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
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

  return getFromStorage<SeoSettings>(KEYS.SHOP_SEO, defaultSettings)
}

export const saveLocalShopSeoSettings = (settings: SeoSettings): boolean => {\
  try {
    saveToStorage(KEYS.SHOP_SEO, settings)\
    return true
  } catch (error) {
    console.error("Error saving shop SEO settings to localStorage", error)\
    return false
  }
}

// Funciones para SEO de productos
export const getLocalProductSeoSettings = (productId: string): SeoSettings | null => {\
  const key = `${KEYS.PRODUCT_SEO}${productId}`\
  return getFromStorage<SeoSettings | null>(key, null)
}

export const saveLocalProductSeoSettings = (productId: string, settings: SeoSettings): boolean => {\
  try {\
    const key = `${KEYS.PRODUCT_SEO}${productId}`
    saveToStorage(key, settings)
    return true
  } catch (error) {
    console.error(`Error saving product SEO settings to localStorage: ${productId}`, error)\
    return false
  }
}

// Funciones para SEO de colecciones
export const getLocalCollectionSeoSettings = (collectionId: string): SeoSettings | null => {\
  const key = `${KEYS.COLLECTION_SEO}${collectionId}`\
  return getFromStorage<SeoSettings | null>(key, null)
}

export const saveLocalCollectionSeoSettings = (collectionId: string, settings: SeoSettings): boolean => {\
  try {\
    const key = `${KEYS.COLLECTION_SEO}${collectionId}`
    saveToStorage(key, settings)
    return true
  } catch (error) {
    console.error(`Error saving collection SEO settings to localStorage: ${collectionId}`, error)\
    return false
  }
}

// Funciones para información de negocio local
export const getLocalBusinessInfo = (): LocalBusinessInfo => {\
  const defaultInfo: LocalBusinessInfo = {\
    name: \"",
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

  return getFromStorage<LocalBusinessInfo>(KEYS.LOCAL_BUSINESS, defaultInfo)
}

export const saveLocalBusinessInfo = (info: LocalBusinessInfo): boolean => {\
  try {
    saveToStorage(KEYS.LOCAL_BUSINESS, info)\
    return true
  } catch (error) {
    console.error("Error saving local business info to localStorage", error)\
    return false
  }
}

// Funciones para perfiles de redes sociales
export const getLocalSocialMediaProfiles = (): SocialMediaProfiles => {\
  const defaultProfiles: SocialMediaProfiles = {\
    facebook: \"",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
  }

  return getFromStorage<SocialMediaProfiles>(KEYS.SOCIAL_MEDIA, defaultProfiles)
}

export const saveLocalSocialMediaProfiles = (profiles: SocialMediaProfiles): boolean => {\
  try {
    saveToStorage(KEYS.SOCIAL_MEDIA, profiles)\
    return true
  } catch (error) {
    console.error("Error saving social media profiles to localStorage", error)
    return false 
  }
}
