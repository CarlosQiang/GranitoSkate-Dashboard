export interface MetafieldInput {
  namespace: string
  key: string
  value: string
  type: string
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
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  pinterest: string
  linkedin: string
  tiktok: string
}
