export interface MetafieldInput {
  namespace: string
  key: string
  value: string
  type: string
}

export interface LocalBusinessData {
  name?: string
  type?: string
  address?: string
  city?: string
  postalCode?: string
  region?: string
  country?: string
  phone?: string
  email?: string
  latitude?: string
  longitude?: string
  openingHours?: string
  priceRange?: string
}

export interface SocialMediaData {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  pinterest?: string
  linkedin?: string
  tiktok?: string
}

export interface SeoMetafields {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonicalUrl?: string
  structuredData?: string
}

export interface LocalBusinessMetafields {
  name: string
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
  telephone: string
  email: string
  openingHours: string[]
  latitude: number
  longitude: number
}

export interface SocialMediaMetafields {
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  pinterest?: string
  linkedin?: string
  tiktok?: string
}

export interface StructuredDataConfig {
  type: "LocalBusiness" | "Product" | "Article" | "BreadcrumbList" | "FAQPage" | "Organization" | "WebSite"
  data: Record<string, any>
}

export type MetafieldType =
  | "single_line_text_field"
  | "multi_line_text_field"
  | "number_integer"
  | "number_decimal"
  | "json"
  | "boolean"
  | "date"
  | "date_time"
  | "url"

export interface LocalBusinessInfo {
  name: string
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
  telephone: string
  email: string
  openingHours: string[]
  latitude: number
  longitude: number
}
