export interface ThemeConfig {
  // Colores principales
  primaryColor: string
  secondaryColor: string
  backgroundColor: string

  // Colores de texto
  textColor?: string
  textSecondaryColor?: string
  linkColor?: string

  // Tipografía
  fontFamily?: string
  baseFontSize?: number
  lineHeight?: number
  headingFontWeight?: string

  // Marca
  shopName?: string
  logoUrl?: string
  faviconUrl?: string

  // Otros
  borderRadius?: string
  buttonStyle?: "rounded" | "square" | "pill"
  cardStyle?: "flat" | "raised" | "bordered"
}

export const defaultTheme: ThemeConfig = {
  primaryColor: "#D4AF37", // Color dorado para GranitoSkate
  secondaryColor: "#4A4A4A",
  backgroundColor: "#F9F9F9",
  textColor: "#333333",
  textSecondaryColor: "#666666",
  linkColor: "#D4AF37",
  fontFamily: "Inter",
  baseFontSize: 16,
  lineHeight: 1.5,
  headingFontWeight: "600",
  shopName: "GranitoSkate",
  borderRadius: "0.375rem",
  buttonStyle: "rounded",
  cardStyle: "raised",
}
