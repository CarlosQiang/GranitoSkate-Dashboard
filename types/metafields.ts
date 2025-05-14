export interface MetafieldInput {
  namespace: string
  key: string
  value: string
  type: string
}

export interface LocalBusinessData {
  name?: string
  type?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  telephone?: string
  email?: string
  openingHours?: string[]
  priceRange?: string
  paymentAccepted?: string[]
  currenciesAccepted?: string[]
}

export interface SocialMediaData {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  linkedin?: string
  pinterest?: string
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
