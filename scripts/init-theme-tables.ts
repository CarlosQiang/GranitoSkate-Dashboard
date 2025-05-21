// Script para inicializar las tablas de tema desde la línea de comandos

import { createThemeTablesIfNotExist } from "@/lib/db/repositories/theme-repository"

async function main() {
  try {
    console.log("Inicializando tablas de tema...")
    const success = await createThemeTablesIfNotExist()

    if (success) {
      console.log("✅ Tablas de tema creadas o verificadas correctamente")
    } else {
      console.error("❌ Error al crear las tablas de tema")
      process.exit(1)
    }
  } catch (error) {
    console.error("Error al inicializar las tablas de tema:", error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error inesperado:", error)
    process.exit(1)
  })
