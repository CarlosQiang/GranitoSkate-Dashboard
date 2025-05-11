export interface MetafieldDefinition {
  id: string
  name: string
  namespace: string
  key: string
  description?: string
  ownerType: "PRODUCT" | "COLLECTION" | "SHOP" | "ARTICLE" | "BLOG" | "PAGE"
  type:
    | "single_line_text_field"
    | "multi_line_text_field"
    | "rich_text"
    | "url"
    | "json"
    | "boolean"
    | "number_integer"
    | "number_decimal"
    | "date"
    | "date_time"
    | "color"
  validations?: {
    required?: boolean
    min?: number
    max?: number
    regex?: string
  }
}

export interface Metafield {
  id: string
  namespace: string
  key: string
  value: string
  type: string
  ownerType: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface MetaobjectDefinition {
  id: string
  name: string
  type: string
  fieldDefinitions: {
    name: string
    key: string
    type: string
    required: boolean
  }[]
}

export interface Metaobject {
  id: string
  type: string
  handle: string
  fields: {
    key: string
    value: string
    type: string
  }[]
}

export interface SeoSettings {
  title: string
  description: string
  keywords: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

export interface LocalBusinessInfo {
  name: string
  type: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  telephone: string
  email: string
  openingHours: string[]
  priceRange: string
  paymentAccepted: string[]
  currenciesAccepted: string[]
}

export interface SocialMediaProfiles {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  linkedin?: string
  pinterest?: string
  tiktok?: string
}

export interface StructuredDataConfig {
  type: "LocalBusiness" | "Product" | "Article" | "BreadcrumbList" | "FAQPage" | "Organization" | "WebSite"
  data: Record<string, any>
}
