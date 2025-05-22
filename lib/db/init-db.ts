import { createThemeTablesIfNotExist } from "@/lib/db/repositories/theme-repository"

export async function initializeDatabase() {
  try {
    console.log("Inicializando base de datos...")

    // Inicializar tablas de tema
    await createThemeTablesIfNotExist()

    // Aquí puedes agregar más inicializaciones de tablas si es necesario

    console.log("Base de datos inicializada correctamente")
    return true
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return false
  }
}
