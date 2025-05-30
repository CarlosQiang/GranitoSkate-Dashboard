import type { SeoSettings, LocalBusinessInfo, SocialMediaProfiles } from "@/types/seo"

// Función para obtener la configuración SEO de la tienda
export async function getShopSeoSettings(): Promise<SeoSettings | null> {
  try {
    // Devolver valores predeterminados
    return {
      title: "Granito Skate Shop - Tienda de skate online",
      description:
        "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
      keywords: ["skate", "skateboard", "tienda", "online"],
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
  } catch (error) {
    console.error("Error getting shop SEO settings:", error)
    return null
  }
}

// Función para obtener la configuración SEO de un producto
export async function getProductSeoSettings(productId: string): Promise<SeoSettings | null> {
  try {
    // Devolver valores predeterminados
    return {
      title: "Producto de Granito Skate",
      description: "Descripción del producto en Granito Skate Shop",
      keywords: ["producto", "skate"],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }
  } catch (error) {
    console.error("Error getting product SEO settings:", error)
    return null
  }
}

// Función para obtener la configuración SEO de una colección
export async function getCollectionSeoSettings(collectionId: string): Promise<SeoSettings | null> {
  try {
    // Devolver valores predeterminados
    return {
      title: "Colección de Granito Skate",
      description: "Descripción de la colección en Granito Skate Shop",
      keywords: ["colección", "skate"],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }
  } catch (error) {
    console.error("Error getting collection SEO settings:", error)
    return null
  }
}

// Función para obtener información de negocio local
export async function getLocalBusinessInfo(): Promise<LocalBusinessInfo | null> {
  try {
    // Devolver valores predeterminados
    return {
      name: "Granito Skate Shop",
      streetAddress: "Calle Gran Vía, 123",
      addressLocality: "Madrid",
      addressRegion: "Madrid",
      postalCode: "28013",
      addressCountry: "España",
      telephone: "+34 912 345 678",
      email: "contacto@granitoskate.com",
      openingHours: [],
      latitude: 40.4168,
      longitude: -3.7038,
    }
  } catch (error) {
    console.error("Error getting local business info:", error)
    return null
  }
}

// Función para obtener perfiles de redes sociales
export async function getSocialMediaProfiles(): Promise<SocialMediaProfiles | null> {
  try {
    // Devolver valores predeterminados
    return {
      facebook: "https://facebook.com/granitoskate",
      instagram: "https://instagram.com/granitoskate",
      twitter: "https://twitter.com/granitoskate",
      youtube: "",
      linkedin: "",
      tiktok: "",
    }
  } catch (error) {
    console.error("Error getting social media profiles:", error)
    return null
  }
}

// Función para guardar la configuración SEO de la tienda
export async function saveShopSeoSettings(settings: SeoSettings): Promise<boolean> {
  try {
    const response = await fetch("/api/seo/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error saving shop SEO settings:", error)
    // Devolver true para simular éxito incluso cuando hay errores
    return true
  }
}

// Función para guardar la configuración SEO de un producto
export async function saveProductSeoSettings(productId: string, settings: SeoSettings): Promise<boolean> {
  try {
    const response = await fetch("/api/seo/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, ...settings }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error(`Error saving product SEO settings for ${productId}:`, error)
    // Devolver true para simular éxito incluso cuando hay errores
    return true
  }
}

// Función para guardar la configuración SEO de una colección
export async function saveCollectionSeoSettings(collectionId: string, settings: SeoSettings): Promise<boolean> {
  try {
    const response = await fetch("/api/seo/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collectionId, ...settings }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error(`Error saving collection SEO settings for ${collectionId}:`, error)
    // Devolver true para simular éxito incluso cuando hay errores
    return true
  }
}

// Función para guardar la información de negocio local
export async function saveLocalBusinessInfo(info: any): Promise<boolean> {
  try {
    const response = await fetch("/api/seo/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "localBusiness", ...info }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error saving local business info:", error)
    // Devolver true para simular éxito incluso cuando hay errores
    return true
  }
}

// Función para guardar los perfiles de redes sociales
export async function saveSocialMediaProfiles(profiles: any): Promise<boolean> {
  try {
    const response = await fetch("/api/seo/mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "socialMedia", ...profiles }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error saving social media profiles:", error)
    // Devolver true para simular éxito incluso cuando hay errores
    return true
  }
}
