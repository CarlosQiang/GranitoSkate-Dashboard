// Archivo simplificado para evitar dependencias de graphql-request
export async function fetchMarkets() {
  return { markets: [] }
}

export async function createMarket() {
  return { success: true, message: "Función temporalmente deshabilitada" }
}

// Añadir las funciones faltantes
export async function fetchBackupRegion() {
  return {
    region: {
      id: "default",
      name: "Región predeterminada",
      countries: ["ES", "FR", "IT", "DE", "UK"],
    },
  }
}
