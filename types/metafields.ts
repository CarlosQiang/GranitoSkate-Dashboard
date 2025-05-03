export interface MetafieldDefinition {
  id: string
  namespace: string
  key: string
  name: string
  description?: string
  type: MetafieldType
  validations?: MetafieldValidation[]
  ownerType: MetafieldOwnerType
  visibleToStorefrontApi: boolean
  pinnedPosition?: number
}

export type MetafieldType =
  | "single_line_text_field"
  | "multi_line_text_field"
  | "rich_text_field"
  | "boolean"
  | "number_integer"
  | "number_decimal"
  | "date"
  | "date_time"
  | "url"
  | "json"
  | "color"
  | "weight"
  | "volume"
  | "dimension"
  | "rating"
  | "product_reference"
  | "file_reference"
  | "page_reference"
  | "variant_reference"
  | "collection_reference"

export type MetafieldOwnerType =
  | "ARTICLE"
  | "BLOG"
  | "COLLECTION"
  | "CUSTOMER"
  | "DRAFTORDER"
  | "ORDER"
  | "PAGE"
  | "PRODUCT"
  | "PRODUCTIMAGE"
  | "PRODUCTVARIANT"
  | "SHOP"

export interface MetafieldValidation {
  name: string
  value: string
}

export interface Metafield {
  id: string
  namespace: string
  key: string
  value: string
  type: MetafieldType
  description?: string
  createdAt: string
  updatedAt: string
  ownerType: MetafieldOwnerType
  ownerId: string
}

export interface MetaobjectDefinition {
  id: string
  name: string
  type: string
  fieldDefinitions: MetaobjectFieldDefinition[]
}

export interface MetaobjectFieldDefinition {
  name: string
  key: string
  type: MetafieldType
  required: boolean
  description?: string
  validations?: MetafieldValidation[]
}

export interface Metaobject {
  id: string
  handle: string
  type: string
  fields: MetaobjectField[]
}

export interface MetaobjectField {
  key: string
  value: string
  type: MetafieldType
}

// SEO específico
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
