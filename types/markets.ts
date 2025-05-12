export interface Market {
  id: string
  name: string
  enabled: boolean
  primary: boolean
  web: {
    domain: string | null
    subfolderSuffix: string | null
  }
  regions: MarketRegion[]
  currency: {
    code: string
    symbol: string
  }
  languages: {
    code: string
    name: string
    primary: boolean
  }[]
}

export interface MarketRegion {
  id: string
  name: string
  countryCode: string
  subregions: {
    code: string
    name: string
  }[]
}

export interface WebPresence {
  id: string
  url: string
  shopName: string
  primaryDomain: string
  domains: {
    id: string
    url: string
    sslEnabled: boolean
  }[]
  myshopifyDomain: string
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    pinterest?: string
  }
  localBusiness: {
    name: string
    address: {
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
    telephone: string
    email: string
    openingHours: string[]
    geo: {
      latitude: number
      longitude: number
    }
  }
}

export interface SeoSettings {
  globalTitle: string
  globalDescription: string
  globalKeywords: string[]
  structuredData: boolean
  googleAnalyticsId: string
  googleTagManagerId: string
  facebookPixelId: string
  robotsTxt: string
  sitemapEnabled: boolean
}
