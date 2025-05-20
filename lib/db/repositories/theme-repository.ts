import { sql } from "@vercel/postgres"
import { type ThemeConfig, defaultThemeConfig } from "@/types/theme-config"

export async function createThemeTablesIfNotExist() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS theme_config (
        id SERIAL PRIMARY KEY,
        shop_id TEXT NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log("Tabla de configuración de tema creada o ya existente")
    return true
  } catch (error) {
    console.error("Error al crear la tabla de configuración de tema:", error)
    return false
  }
}

export async function getThemeConfig(shopId: string): Promise<ThemeConfig> {
  try {
    const result = await sql`
      SELECT config FROM theme_config 
      WHERE shop_id = ${shopId} 
      ORDER BY updated_at DESC 
      LIMIT 1
    `

    if (result.rows.length > 0) {
      return result.rows[0].config as ThemeConfig
    }

    // Si no hay configuración, crear una con los valores predeterminados
    await saveThemeConfig(shopId, defaultThemeConfig)
    return defaultThemeConfig
  } catch (error) {
    console.error("Error al obtener la configuración del tema:", error)
    return defaultThemeConfig
  }
}

export async function saveThemeConfig(shopId: string, config: ThemeConfig): Promise<boolean> {
  try {
    // Verificar si ya existe una configuración para esta tienda
    const existingConfig = await sql`
      SELECT id FROM theme_config 
      WHERE shop_id = ${shopId}
    `

    if (existingConfig.rows.length > 0) {
      // Actualizar la configuración existente
      await sql`
        UPDATE theme_config 
        SET config = ${JSON.stringify(config)}, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE shop_id = ${shopId}
      `
    } else {
      // Crear una nueva configuración
      await sql`
        INSERT INTO theme_config (shop_id, config) 
        VALUES (${shopId}, ${JSON.stringify(config)})
      `
    }

    return true
  } catch (error) {
    console.error("Error al guardar la configuración del tema:", error)
    return false
  }
}
