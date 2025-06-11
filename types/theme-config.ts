export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  enableDarkMode: boolean
  preferDarkMode: boolean
  fontFamily: string
  headingFontFamily: string
  borderRadius: "none" | "small" | "medium" | "large" | "full"
  buttonStyle: "solid" | "outline" | "soft" | "ghost"
  cardStyle: "flat" | "raised" | "bordered"
  sidebarStyle: "default" | "compact" | "expanded"
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"
  shopName: string
  logoUrl: string | null
  favicon: string | null
}

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#c7a04a", // Color Granito dorado
  secondaryColor: "#4a5568",
  accentColor: "#3182ce",
  enableDarkMode: true,
  preferDarkMode: false,
  fontFamily: "Inter, sans-serif",
  headingFontFamily: "Inter, sans-serif",
  borderRadius: "medium",
  buttonStyle: "solid",
  cardStyle: "raised",
  sidebarStyle: "default",
  enableAnimations: true,
  animationSpeed: "normal",
  shopName: "Granito Management app",
  logoUrl: "/logo-granito-management.png",
  favicon: "/favicon-granito.ico",
}
