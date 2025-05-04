import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"
import type { MetafieldInput, LocalBusinessData, SocialMediaData, SeoMetafields } from "@/types/metafields"

// Función para obtener metafields de un recurso
export async function getMetafields(ownerId: string, ownerType: string) {
  const query = gql`
    query GetMetafields($ownerId: ID!, $ownerType: MetafieldOwnerType!) {
      metafields(first: 100, owner: { id: $ownerId, type: $ownerType }) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes("gid://shopify/")
    let formattedId = ownerId
    const formattedOwnerType = ownerType

    // Si no es un ID completo, formatearlo según el tipo de propietario
    if (!isFullShopifyId) {
      switch (ownerType) {
        case "PRODUCT":
          formattedId = `gid://shopify/Product/${ownerId}`
          break
        case "COLLECTION":
          formattedId = `gid://shopify/Collection/${ownerId}`
          break
        case "SHOP":
          formattedId = `gid://shopify/Shop/${ownerId}`
          break
        default:
          throw new Error(`Tipo de propietario no soportado: ${ownerType}`)
      }
    }

    const data = await shopifyClient.request(query, {
      ownerId: formattedId,
      ownerType: formattedOwnerType,
    })

    if (!data || !data.metafields || !data.metafields.edges) {
      return []
    }

    return data.metafields.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error(`Error fetching metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafields: ${(error as Error).message}`)
  }
}

// Función para obtener un metafield específico
export async function getMetafield(ownerId: string, ownerType: string, namespace: string, key: string) {
  try {
    const metafields = await getMetafields(ownerId, ownerType)
    return metafields.find((metafield: any) => metafield.namespace === namespace && metafield.key === key) || null
  } catch (error) {
    console.error(`Error fetching specific metafield for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafield específico: ${(error as Error).message}`)
  }
}

// Función para establecer un metafield
export async function setMetafield(
  ownerId: string,
  ownerType: string,
  namespace: string,
  key: string,
  value: string,
  type: string,
) {
  const mutation = gql`
    mutation MetafieldSet($input: MetafieldInput!) {
      metafieldSet(metafield: $input) {
        metafield {
          id
          namespace
          key
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = ownerId.includes("gid://shopify/")
    let formattedId = ownerId
    const formattedOwnerType = ownerType

    // Si no es un ID completo, formatearlo según el tipo de propietario
    if (!isFullShopifyId) {
      switch (ownerType) {
        case "PRODUCT":
          formattedId = `gid://shopify/Product/${ownerId}`
          break
        case "COLLECTION":
          formattedId = `gid://shopify/Collection/${ownerId}`
          break
        case "SHOP":
          formattedId = `gid://shopify/Shop/${ownerId}`
          break
        default:
          throw new Error(`Tipo de propietario no soportado: ${ownerType}`)
      }
    }

    const input = {
      ownerId: formattedId,
      namespace,
      key,
      value,
      type,
    }

    const data = await shopifyClient.request(mutation, { input })

    if (data.metafieldSet.userErrors && data.metafieldSet.userErrors.length > 0) {
      throw new Error(data.metafieldSet.userErrors[0].message)
    }

    return data.metafieldSet.metafield
  } catch (error) {
    console.error(`Error setting metafield for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al establecer metafield: ${(error as Error).message}`)
  }
}

// Función para eliminar un metafield
export async function deleteMetafield(metafieldId: string) {
  const mutation = gql`
    mutation MetafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `

  try {
    // Asegurarse de que el ID tenga el formato correcto
    const isFullShopifyId = metafieldId.includes("gid://shopify/Metafield/")
    const formattedId = isFullShopifyId ? metafieldId : `gid://shopify/Metafield/${metafieldId}`

    const data = await shopifyClient.request(mutation, {
      input: {
        id: formattedId,
      },
    })

    if (data.metafieldDelete.userErrors && data.metafieldDelete.userErrors.length > 0) {
      throw new Error(data.metafieldDelete.userErrors[0].message)
    }

    return data.metafieldDelete.deletedId
  } catch (error) {
    console.error(`Error deleting metafield ${metafieldId}:`, error)
    throw new Error(`Error al eliminar metafield: ${(error as Error).message}`)
  }
}

// Función para establecer múltiples metafields para SEO
export async function setSeoMetafields(ownerId: string, ownerType: string, metafields: MetafieldInput[]) {
  try {
    const metafieldPromises = metafields.map((metafield) =>
      setMetafield(
        ownerId,
        ownerType,
        metafield.namespace,
        metafield.key,
        metafield.value,
        metafield.type || "single_line_text_field",
      ),
    )

    return await Promise.all(metafieldPromises)
  } catch (error) {
    console.error(`Error setting multiple metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al establecer múltiples metafields: ${(error as Error).message}`)
  }
}

// Función para obtener metafields de SEO
export async function getSeoMetafields(ownerId: string, ownerType: string) {
  try {
    const metafields = await getMetafields(ownerId, ownerType)
    return metafields.filter((metafield: any) => metafield.namespace === "seo")
  } catch (error) {
    console.error(`Error fetching SEO metafields for ${ownerType} ${ownerId}:`, error)
    throw new Error(`Error al obtener metafields de SEO: ${(error as Error).message}`)
  }
}

// Función para establecer datos de Local Business
export async function setLocalBusinessData(shopId: string, localBusiness: LocalBusinessData) {
  try {
    const metafieldPromises = []

    // Nombre del negocio
    if (localBusiness.name !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "name", localBusiness.name, "single_line_text_field"),
      )
    }

    // Tipo de negocio
    if (localBusiness.type !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "type", localBusiness.type, "single_line_text_field"),
      )
    }

    // Dirección
    if (localBusiness.address !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "address", localBusiness.address, "single_line_text_field"),
      )
    }

    // Ciudad
    if (localBusiness.city !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "city", localBusiness.city, "single_line_text_field"),
      )
    }

    // Código postal
    if (localBusiness.postalCode !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "postal_code",
          localBusiness.postalCode,
          "single_line_text_field",
        ),
      )
    }

    // Región/Provincia
    if (localBusiness.region !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "region", localBusiness.region, "single_line_text_field"),
      )
    }

    // País
    if (localBusiness.country !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "country", localBusiness.country, "single_line_text_field"),
      )
    }

    // Teléfono
    if (localBusiness.phone !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "phone", localBusiness.phone, "single_line_text_field"),
      )
    }

    // Email
    if (localBusiness.email !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "email", localBusiness.email, "single_line_text_field"),
      )
    }

    // Latitud
    if (localBusiness.latitude !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "latitude", localBusiness.latitude, "single_line_text_field"),
      )
    }

    // Longitud
    if (localBusiness.longitude !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "local_business", "longitude", localBusiness.longitude, "single_line_text_field"),
      )
    }

    // Horario de apertura
    if (localBusiness.openingHours !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "opening_hours",
          localBusiness.openingHours,
          "multi_line_text_field",
        ),
      )
    }

    // Precio
    if (localBusiness.priceRange !== undefined) {
      metafieldPromises.push(
        setMetafield(
          shopId,
          "SHOP",
          "local_business",
          "price_range",
          localBusiness.priceRange,
          "single_line_text_field",
        ),
      )
    }

    return await Promise.all(metafieldPromises)
  } catch (error) {
    console.error(`Error setting local business data for shop ${shopId}:`, error)
    throw new Error(`Error al establecer datos de negocio local: ${(error as Error).message}`)
  }
}

// Función para obtener datos de Local Business
export async function getLocalBusinessData(shopId: string): Promise<LocalBusinessData> {
  try {
    const metafields = await getMetafields(shopId, "SHOP")
    const localBusinessMetafields = metafields.filter((metafield: any) => metafield.namespace === "local_business")

    const localBusinessData: LocalBusinessData = {}

    localBusinessMetafields.forEach((metafield: any) => {
      switch (metafield.key) {
        case "name":
          localBusinessData.name = metafield.value
          break
        case "type":
          localBusinessData.type = metafield.value
          break
        case "address":
          localBusinessData.address = metafield.value
          break
        case "city":
          localBusinessData.city = metafield.value
          break
        case "postal_code":
          localBusinessData.postalCode = metafield.value
          break
        case "region":
          localBusinessData.region = metafield.value
          break
        case "country":
          localBusinessData.country = metafield.value
          break
        case "phone":
          localBusinessData.phone = metafield.value
          break
        case "email":
          localBusinessData.email = metafield.value
          break
        case "latitude":
          localBusinessData.latitude = metafield.value
          break
        case "longitude":
          localBusinessData.longitude = metafield.value
          break
        case "opening_hours":
          localBusinessData.openingHours = metafield.value
          break
        case "price_range":
          localBusinessData.priceRange = metafield.value
          break
      }
    })

    return localBusinessData
  } catch (error) {
    console.error(`Error fetching local business data for shop ${shopId}:`, error)
    throw new Error(`Error al obtener datos de negocio local: ${(error as Error).message}`)
  }
}

// Función para establecer datos de redes sociales
export async function setSocialMediaData(shopId: string, socialMedia: SocialMediaData) {
  try {
    const metafieldPromises = []

    // Facebook
    if (socialMedia.facebook !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "facebook", socialMedia.facebook, "single_line_text_field"),
      )
    }

    // Twitter
    if (socialMedia.twitter !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "twitter", socialMedia.twitter, "single_line_text_field"),
      )
    }

    // Instagram
    if (socialMedia.instagram !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "instagram", socialMedia.instagram, "single_line_text_field"),
      )
    }

    // YouTube
    if (socialMedia.youtube !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "youtube", socialMedia.youtube, "single_line_text_field"),
      )
    }

    // Pinterest
    if (socialMedia.pinterest !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "pinterest", socialMedia.pinterest, "single_line_text_field"),
      )
    }

    // LinkedIn
    if (socialMedia.linkedin !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "linkedin", socialMedia.linkedin, "single_line_text_field"),
      )
    }

    // TikTok
    if (socialMedia.tiktok !== undefined) {
      metafieldPromises.push(
        setMetafield(shopId, "SHOP", "social_media", "tiktok", socialMedia.tiktok, "single_line_text_field"),
      )
    }

    return await Promise.all(metafieldPromises)
  } catch (error) {
    console.error(`Error setting social media data for shop ${shopId}:`, error)
    throw new Error(`Error al establecer datos de redes sociales: ${(error as Error).message}`)
  }
}

// Función para obtener datos de redes sociales
export async function getSocialMediaData(shopId: string): Promise<SocialMediaData> {
  try {
    const metafields = await getMetafields(shopId, "SHOP")
    const socialMediaMetafields = metafields.filter((metafield: any) => metafield.namespace === "social_media")

    const socialMediaData: SocialMediaData = {}

    socialMediaMetafields.forEach((metafield: any) => {
      switch (metafield.key) {
        case "facebook":
          socialMediaData.facebook = metafield.value
          break
        case "twitter":
          socialMediaData.twitter = metafield.value
          break
        case "instagram":
          socialMediaData.instagram = metafield.value
          break
        case "youtube":
          socialMediaData.youtube = metafield.value
          break
        case "pinterest":
          socialMediaData.pinterest = metafield.value
          break
        case "linkedin":
          socialMediaData.linkedin = metafield.value
          break
        case "tiktok":
          socialMediaData.tiktok = metafield.value
          break
      }
    })

    return socialMediaData
  } catch (error) {
    console.error(`Error fetching social media data for shop ${shopId}:`, error)
    throw new Error(`Error al obtener datos de redes sociales: ${(error as Error).message}`)
  }
}

// Añadir las funciones que faltan
export async function fetchSeoMetafields(ownerId: string, ownerType: string): Promise<SeoMetafields> {
  try {
    const metafields = await getMetafields(ownerId, ownerType)
    const seoMetafields = metafields.filter((metafield: any) => metafield.namespace === "seo")

    const result: SeoMetafields = {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }

    seoMetafields.forEach((metafield: any) => {
      switch (metafield.key) {
        case "title":
          result.title = metafield.value
          break
        case "description":
          result.description = metafield.value
          break
        case "keywords":
          try {
            result.keywords = JSON.parse(metafield.value)
          } catch (e) {
            result.keywords = metafield.value.split(",").map((k: string) => k.trim())
          }
          break
        case "og_title":
          result.ogTitle = metafield.value
          break
        case "og_description":
          result.ogDescription = metafield.value
          break
        case "og_image":
          result.ogImage = metafield.value
          break
        case "twitter_title":
          result.twitterTitle = metafield.value
          break
        case "twitter_description":
          result.twitterDescription = metafield.value
          break
        case "twitter_image":
          result.twitterImage = metafield.value
          break
        case "canonical_url":
          result.canonicalUrl = metafield.value
          break
      }
    })

    return result
  } catch (error) {
    console.error(`Error fetching SEO metafields for ${ownerType} ${ownerId}:`, error)
    return {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
      canonicalUrl: "",
    }
  }
}

export async function saveSeoMetafields(ownerId: string, ownerType: string, seoData: SeoMetafields): Promise<boolean> {
  try {
    const metafieldPromises = []

    if (seoData.title !== undefined) {
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "title", seoData.title, "single_line_text_field"))
    }

    if (seoData.description !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "description", seoData.description, "multi_line_text_field"),
      )
    }

    if (seoData.keywords !== undefined) {
      const keywordsValue =
        typeof seoData.keywords === "string"
          ? seoData.keywords
          : Array.isArray(seoData.keywords)
            ? JSON.stringify(seoData.keywords)
            : ""
      metafieldPromises.push(setMetafield(ownerId, ownerType, "seo", "keywords", keywordsValue, "json"))
    }

    if (seoData.ogTitle !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "og_title", seoData.ogTitle, "single_line_text_field"),
      )
    }

    if (seoData.ogDescription !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "og_description", seoData.ogDescription, "multi_line_text_field"),
      )
    }

    if (seoData.ogImage !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "og_image", seoData.ogImage, "single_line_text_field"),
      )
    }

    if (seoData.twitterTitle !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "twitter_title", seoData.twitterTitle, "single_line_text_field"),
      )
    }

    if (seoData.twitterDescription !== undefined) {
      metafieldPromises.push(
        setMetafield(
          ownerId,
          ownerType,
          "seo",
          "twitter_description",
          seoData.twitterDescription,
          "multi_line_text_field",
        ),
      )
    }

    if (seoData.twitterImage !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "twitter_image", seoData.twitterImage, "single_line_text_field"),
      )
    }

    if (seoData.canonicalUrl !== undefined) {
      metafieldPromises.push(
        setMetafield(ownerId, ownerType, "seo", "canonical_url", seoData.canonicalUrl, "single_line_text_field"),
      )
    }

    await Promise.all(metafieldPromises)
    return true
  } catch (error) {
    console.error(`Error saving SEO metafields for ${ownerType} ${ownerId}:`, error)
    return false
  }
}

export async function fetchLocalBusinessMetafields(shopId: string): Promise<any> {
  return getLocalBusinessData(shopId)
}

export async function saveLocalBusinessMetafields(shopId: string, data: LocalBusinessData): Promise<boolean> {
  try {
    await setLocalBusinessData(shopId, data)
    return true
  } catch (error) {
    console.error(`Error saving local business metafields for shop ${shopId}:`, error)
    return false
  }
}
