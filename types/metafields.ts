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
