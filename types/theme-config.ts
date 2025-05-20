export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  borderRadius: "none" | "small" | "medium" | "large" | "full"
  fontFamily: string
  headingFontFamily: string
  buttonStyle: "solid" | "outline" | "soft" | "ghost"
  cardStyle: "flat" | "raised" | "bordered"
  sidebarStyle: "default" | "compact" | "expanded"
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"
  enableDarkMode: boolean
  preferDarkMode: boolean
  shopName: string
  logoUrl: string | null
  favicon: string | null
}

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#c7a04a", // Color Granito
  secondaryColor: "#4a5568", // Gris oscuro
  accentColor: "#3182ce", // Azul
  borderRadius: "medium",
  fontFamily: "Inter, sans-serif",
  headingFontFamily: "Inter, sans-serif",
  buttonStyle: "solid",
  cardStyle: "raised",
  sidebarStyle: "default",
  enableAnimations: true,
  animationSpeed: "normal",
  enableDarkMode: true,
  preferDarkMode: false,
  shopName: "GranitoSkate",
  logoUrl: null,
  favicon: null,
}
