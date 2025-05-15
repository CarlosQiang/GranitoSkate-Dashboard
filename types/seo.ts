export interface MetafieldDefinition {
  id: string
  name: string
  namespace: string
  key: string
  description?: string
  ownerType: string
  type: string
  validations?: Record<string, any>
}

export interface Metafield {
  id?: string
  namespace: string
  key: string
  value: string
  type: string
  ownerType?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface SeoSettings {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonicalUrl?: string
  marketTitle?: string
  marketDescription?: string
  marketKeywords?: string[]
  targetCountries?: string[]
}

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

export interface SocialMediaProfiles {
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  linkedin: string
  tiktok: string
}
