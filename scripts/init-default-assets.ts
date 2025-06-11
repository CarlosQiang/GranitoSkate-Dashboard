import { initializeDefaultAssets } from "@/lib/db/repositories/theme-repository"

async function initDefaultAssets() {
  try {
    console.log("Inicializando assets predeterminados...")

    // Usar un shopId predeterminado para la demostración
    const defaultShopId = "default-shop"

    await initializeDefaultAssets(defaultShopId)

    console.log("✅ Assets predeterminados inicializados correctamente")
    console.log("Logo: /logo-granito-management.png")
    console.log("Favicon: /favicon-granito.ico")
  } catch (error) {
    console.error("❌ Error al inicializar los assets:", error)
  }
}

// Ejecutar el script
initDefaultAssets()
