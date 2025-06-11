import { sql } from "@vercel/postgres"
import { type ThemeConfig, defaultThemeConfig } from "@/types/theme-config"

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

export async function createThemeTablesIfNotExist() {
  try {
    // Crear tabla theme_configs
    await sql`
      CREATE TABLE IF NOT EXISTS theme_configs (
        id SERIAL PRIMARY KEY,
        shop_id VARCHAR(255) NOT NULL,
        config_name VARCHAR(255) NOT NULL DEFAULT 'default',
        is_active BOOLEAN NOT NULL DEFAULT true,
        primary_color VARCHAR(20) NOT NULL,
        secondary_color VARCHAR(20) NOT NULL,
        accent_color VARCHAR(20) NOT NULL,
        font_family VARCHAR(255),
        heading_font_family VARCHAR(255),
        border_radius VARCHAR(20),
        button_style VARCHAR(20),
        card_style VARCHAR(20),
        sidebar_style VARCHAR(20),
        enable_animations BOOLEAN DEFAULT true,
        animation_speed VARCHAR(20) DEFAULT 'normal',
        enable_dark_mode BOOLEAN DEFAULT true,
        prefer_dark_mode BOOLEAN DEFAULT false,
        shop_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_id, config_name)
      );
    `

    // Crear tabla theme_assets
    await sql`
      CREATE TABLE IF NOT EXISTS theme_assets (
        id SERIAL PRIMARY KEY,
        shop_id VARCHAR(255) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_id, asset_type)
      );
    `

    // Crear tabla theme_settings
    await sql`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id SERIAL PRIMARY KEY,
        shop_id VARCHAR(255) NOT NULL,
        setting_key VARCHAR(255) NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_id, setting_key)
      );
    `

    // Crear índices
    await sql`CREATE INDEX IF NOT EXISTS idx_theme_configs_shop_id ON theme_configs(shop_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_theme_assets_shop_id ON theme_assets(shop_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_theme_settings_shop_id ON theme_settings(shop_id);`

    console.log("Tablas de tema creadas o ya existentes")
    return true
  } catch (error) {
    console.error("Error al crear las tablas de tema:", error)
    return false
  }
}

export async function getThemeConfig(shopId: string, configName = "default"): Promise<ThemeConfig> {
  try {
    const result = await sql`
      SELECT 
        primary_color, secondary_color, accent_color, 
        font_family, heading_font_family, border_radius,
        button_style, card_style, sidebar_style,
        enable_animations, animation_speed,
        enable_dark_mode, prefer_dark_mode,
        shop_name
      FROM theme_configs 
      WHERE shop_id = ${shopId} 
        AND config_name = ${configName}
        AND is_active = true
      ORDER BY updated_at DESC 
      LIMIT 1
    `

    if (result.rows.length > 0) {
      // Convertir de snake_case a camelCase
      const dbConfig = result.rows[0]

      // Obtener los assets (logo, favicon)
      const logoAsset = await getThemeAsset(shopId, "logo")
      const faviconAsset = await getThemeAsset(shopId, "favicon")

      return {
        primaryColor: dbConfig.primary_color,
        secondaryColor: dbConfig.secondary_color,
        accentColor: dbConfig.accent_color,
        fontFamily: dbConfig.font_family || defaultThemeConfig.fontFamily,
        headingFontFamily: dbConfig.heading_font_family || defaultThemeConfig.headingFontFamily,
        borderRadius: (dbConfig.border_radius as any) || defaultThemeConfig.borderRadius,
        buttonStyle: (dbConfig.button_style as any) || defaultThemeConfig.buttonStyle,
        cardStyle: (dbConfig.card_style as any) || defaultThemeConfig.cardStyle,
        sidebarStyle: (dbConfig.sidebar_style as any) || defaultThemeConfig.sidebarStyle,
        enableAnimations: dbConfig.enable_animations,
        animationSpeed: (dbConfig.animation_speed as any) || defaultThemeConfig.animationSpeed,
        enableDarkMode: dbConfig.enable_dark_mode,
        preferDarkMode: dbConfig.prefer_dark_mode,
        shopName: dbConfig.shop_name || defaultThemeConfig.shopName,
        logoUrl: logoAsset ? logoAsset.filePath : defaultThemeConfig.logoUrl,
        favicon: faviconAsset ? faviconAsset.filePath : defaultThemeConfig.favicon,
      }
    }

    // Si no hay configuración, crear una con los valores predeterminados e inicializar los assets
    await saveThemeConfig(shopId, defaultThemeConfig, configName)
    await initializeDefaultAssets(shopId)
    return defaultThemeConfig
  } catch (error) {
    console.error("Error al obtener la configuración del tema:", error)
    return defaultThemeConfig
  }
}

// Nueva función para inicializar los assets predeterminados
export async function initializeDefaultAssets(shopId: string): Promise<void> {
  try {
    // Verificar si ya existen los assets
    const existingLogo = await getThemeAsset(shopId, "logo")
    const existingFavicon = await getThemeAsset(shopId, "favicon")

    // Si no existe el logo, crear el registro con la ruta predeterminada
    if (!existingLogo && defaultThemeConfig.logoUrl) {
      await saveThemeAsset(
        shopId,
        "logo",
        "logo-granito-management.png",
        defaultThemeConfig.logoUrl,
        "image/png",
        0, // Tamaño desconocido para archivos predeterminados
        256,
        256,
      )
    }

    // Si no existe el favicon, crear el registro con la ruta predeterminada
    if (!existingFavicon && defaultThemeConfig.favicon) {
      await saveThemeAsset(
        shopId,
        "favicon",
        "favicon-granito.ico",
        defaultThemeConfig.favicon,
        "image/x-icon",
        0, // Tamaño desconocido para archivos predeterminados
        32,
        32,
      )
    }
  } catch (error) {
    console.error("Error al inicializar los assets predeterminados:", error)
  }
}

export async function saveThemeConfig(shopId: string, config: ThemeConfig, configName = "default"): Promise<boolean> {
  try {
    // Verificar si ya existe una configuración para esta tienda
    const existingConfig = await sql`
      SELECT id FROM theme_configs 
      WHERE shop_id = ${shopId}
        AND config_name = ${configName}
    `

    if (existingConfig.rows.length > 0) {
      // Actualizar la configuración existente
      await sql`
        UPDATE theme_configs 
        SET 
          primary_color = ${config.primaryColor},
          secondary_color = ${config.secondaryColor},
          accent_color = ${config.accentColor},
          font_family = ${config.fontFamily},
          heading_font_family = ${config.headingFontFamily},
          border_radius = ${config.borderRadius},
          button_style = ${config.buttonStyle},
          card_style = ${config.cardStyle},
          sidebar_style = ${config.sidebarStyle},
          enable_animations = ${config.enableAnimations},
          animation_speed = ${config.animationSpeed},
          enable_dark_mode = ${config.enableDarkMode},
          prefer_dark_mode = ${config.preferDarkMode},
          shop_name = ${config.shopName},
          updated_at = CURRENT_TIMESTAMP 
        WHERE shop_id = ${shopId}
          AND config_name = ${configName}
      `
    } else {
      // Crear una nueva configuración
      await sql`
        INSERT INTO theme_configs (
          shop_id, config_name, primary_color, secondary_color, accent_color,
          font_family, heading_font_family, border_radius,
          button_style, card_style, sidebar_style,
          enable_animations, animation_speed,
          enable_dark_mode, prefer_dark_mode,
          shop_name
        ) 
        VALUES (
          ${shopId}, ${configName}, ${config.primaryColor}, ${config.secondaryColor}, ${config.accentColor},
          ${config.fontFamily}, ${config.headingFontFamily}, ${config.borderRadius},
          ${config.buttonStyle}, ${config.cardStyle}, ${config.sidebarStyle},
          ${config.enableAnimations}, ${config.animationSpeed},
          ${config.enableDarkMode}, ${config.preferDarkMode},
          ${config.shopName}
        )
      `
    }

    return true
  } catch (error) {
    console.error("Error al guardar la configuración del tema:", error)
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
