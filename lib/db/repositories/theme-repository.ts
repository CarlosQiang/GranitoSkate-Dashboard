import { sql, query } from "@vercel/postgres"
import { type ThemeConfig, defaultThemeConfig } from "@/types/theme-config"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "theme-repository",
})

export interface ThemeAsset {
  id: number
  shopId: string
  assetType: string
  fileName: string
  filePath: string
  mimeType: string
  fileSize: number
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

// Función para crear las tablas de tema si no existen
export async function createThemeTablesIfNotExist(): Promise<boolean> {
  try {
    // Verificar si la tabla ya existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracion_tema'
      )
    `)

    if (!tableExists.rows[0].exists) {
      // Crear la tabla si no existe
      await query(`
        CREATE TABLE configuracion_tema (
          id SERIAL PRIMARY KEY,
          tienda_id VARCHAR(255) UNIQUE NOT NULL,
          configuracion JSONB NOT NULL,
          fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)

      logger.info("Tabla de configuración de tema creada correctamente")
    }

    return true
  } catch (error) {
    logger.error("Error al crear la tabla de configuración de tema:", error)
    return false
  }
}

export async function getThemeConfig(shopId: string): Promise<ThemeConfig> {
  try {
    // Buscar la configuración en la base de datos
    const result = await query("SELECT configuracion FROM configuracion_tema WHERE tienda_id = $1", [shopId])

    // Si no existe, devolver la configuración por defecto
    if (result.rows.length === 0) {
      return defaultThemeConfig
    }

    // Devolver la configuración encontrada
    return result.rows[0].configuracion as ThemeConfig
  } catch (error) {
    logger.error("Error al obtener la configuración del tema:", error)
    return defaultThemeConfig
  }
}

export async function saveThemeConfig(shopId: string, config: ThemeConfig): Promise<boolean> {
  try {
    // Verificar si ya existe una configuración para esta tienda
    const existingConfig = await query("SELECT id FROM configuracion_tema WHERE tienda_id = $1", [shopId])

    if (existingConfig.rows.length > 0) {
      // Actualizar la configuración existente
      await query(
        "UPDATE configuracion_tema SET configuracion = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE tienda_id = $2",
        [config, shopId],
      )
    } else {
      // Insertar una nueva configuración
      await query("INSERT INTO configuracion_tema (tienda_id, configuracion) VALUES ($1, $2)", [shopId, config])
    }

    return true
  } catch (error) {
    logger.error("Error al guardar la configuración del tema:", error)
    return false
  }
}

export async function saveThemeAsset(
  shopId: string,
  assetType: string,
  fileName: string,
  filePath: string,
  mimeType: string,
  fileSize: number,
  width?: number,
  height?: number,
): Promise<ThemeAsset | null> {
  try {
    // Verificar si ya existe un asset de este tipo para esta tienda
    const existingAsset = await sql`
      SELECT id FROM theme_assets 
      WHERE shop_id = ${shopId}
        AND asset_type = ${assetType}
    `

    let result

    if (existingAsset.rows.length > 0) {
      // Actualizar el asset existente
      result = await sql`
        UPDATE theme_assets 
        SET 
          file_name = ${fileName},
          file_path = ${filePath},
          mime_type = ${mimeType},
          file_size = ${fileSize},
          width = ${width || null},
          height = ${height || null},
          updated_at = CURRENT_TIMESTAMP 
        WHERE shop_id = ${shopId}
          AND asset_type = ${assetType}
        RETURNING *
      `
    } else {
      // Crear un nuevo asset
      result = await sql`
        INSERT INTO theme_assets (
          shop_id, asset_type, file_name, file_path, mime_type, file_size, width, height
        ) 
        VALUES (
          ${shopId}, ${assetType}, ${fileName}, ${filePath}, ${mimeType}, ${fileSize}, ${width || null}, ${height || null}
        )
        RETURNING *
      `
    }

    if (result.rows.length > 0) {
      const asset = result.rows[0]
      return {
        id: asset.id,
        shopId: asset.shop_id,
        assetType: asset.asset_type,
        fileName: asset.file_name,
        filePath: asset.file_path,
        mimeType: asset.mime_type,
        fileSize: asset.file_size,
        width: asset.width,
        height: asset.height,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      }
    }

    return null
  } catch (error) {
    console.error("Error al guardar el asset del tema:", error)
    return null
  }
}

export async function getThemeAsset(shopId: string, assetType: string): Promise<ThemeAsset | null> {
  try {
    const result = await sql`
      SELECT * FROM theme_assets 
      WHERE shop_id = ${shopId}
        AND asset_type = ${assetType}
    `

    if (result.rows.length > 0) {
      const asset = result.rows[0]
      return {
        id: asset.id,
        shopId: asset.shop_id,
        assetType: asset.asset_type,
        fileName: asset.file_name,
        filePath: asset.file_path,
        mimeType: asset.mime_type,
        fileSize: asset.file_size,
        width: asset.width,
        height: asset.height,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      }
    }

    return null
  } catch (error) {
    console.error("Error al obtener el asset del tema:", error)
    return null
  }
}

export async function deleteThemeAsset(shopId: string, assetType: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM theme_assets 
      WHERE shop_id = ${shopId}
        AND asset_type = ${assetType}
    `

    return true
  } catch (error) {
    console.error("Error al eliminar el asset del tema:", error)
    return false
  }
}

export async function saveThemeSetting(shopId: string, key: string, value: string): Promise<boolean> {
  try {
    // Verificar si ya existe una configuración para esta tienda
    const existingSetting = await sql`
      SELECT id FROM theme_settings 
      WHERE shop_id = ${shopId}
        AND setting_key = ${key}
    `

    if (existingSetting.rows.length > 0) {
      // Actualizar la configuración existente
      await sql`
        UPDATE theme_settings 
        SET 
          setting_value = ${value},
          updated_at = CURRENT_TIMESTAMP 
        WHERE shop_id = ${shopId}
          AND setting_key = ${key}
      `
    } else {
      // Crear una nueva configuración
      await sql`
        INSERT INTO theme_settings (
          shop_id, setting_key, setting_value
        ) 
        VALUES (
          ${shopId}, ${key}, ${value}
        )
      `
    }

    return true
  } catch (error) {
    console.error("Error al guardar la configuración del tema:", error)
    return false
  }
}

export async function getThemeSetting(shopId: string, key: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT setting_value FROM theme_settings 
      WHERE shop_id = ${shopId}
        AND setting_key = ${key}
    `

    if (result.rows.length > 0) {
      return result.rows[0].setting_value
    }

    return null
  } catch (error) {
    console.error("Error al obtener la configuración del tema:", error)
    return null
  }
}
