import { sql } from "@vercel/postgres"

export async function verificarBaseDatos() {
  try {
    console.log("🔍 Verificando conexión a base de datos...")

    // Verificar conexión
    const result = await sql`SELECT NOW() as timestamp`
    console.log("✅ Conexión a base de datos exitosa:", result.rows[0].timestamp)

    // Verificar tabla de administradores
    const adminCheck = await sql`
      SELECT COUNT(*) as count FROM administradores WHERE activo = true
    `
    console.log("✅ Administradores activos:", adminCheck.rows[0].count)

    // Verificar tablas principales
    const tables = [
      "usuarios",
      "administradores",
      "productos",
      "colecciones",
      "clientes",
      "pedidos",
      "promociones",
      "configuracion_shopify",
    ]

    for (const table of tables) {
      try {
        const tableCheck = await sql.query(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`✅ Tabla ${table}: ${tableCheck.rows[0].count} registros`)
      } catch (error) {
        console.error(`❌ Error en tabla ${table}:`, error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("❌ Error verificando base de datos:", error)
    return false
  }
}

export async function verificarShopify() {
  try {
    console.log("🔍 Verificando configuración de Shopify...")

    const requiredEnvs = ["NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ACCESS_TOKEN", "SHOPIFY_API_URL"]

    const missing = requiredEnvs.filter((env) => !process.env[env])

    if (missing.length > 0) {
      console.warn("⚠️ Variables de entorno faltantes:", missing)
      return false
    }

    console.log("✅ Variables de entorno de Shopify configuradas")
    return true
  } catch (error) {
    console.error("❌ Error verificando Shopify:", error)
    return false
  }
}

export async function verificarAuth() {
  try {
    console.log("🔍 Verificando configuración de autenticación...")

    const requiredEnvs = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"]
    const missing = requiredEnvs.filter((env) => !process.env[env])

    if (missing.length > 0) {
      console.warn("⚠️ Variables de entorno de auth faltantes:", missing)
      return false
    }

    console.log("✅ Variables de entorno de autenticación configuradas")
    return true
  } catch (error) {
    console.error("❌ Error verificando autenticación:", error)
    return false
  }
}
