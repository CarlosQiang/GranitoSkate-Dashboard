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
  telephone?: string
  email?: string
  openingHours?: string
  latitude?: string
  longitude?: string
}

export interface SocialMediaData {
  facebook?: string
  instagram?: string
  twitter?: string
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

export interface SocialMediaProfiles {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  linkedin?: string
  pinterest?: string
  tiktok?: string
}
