import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Intentar obtener la configuración del tema desde la base de datos
    const { rows } = await sql`
      SELECT config FROM theme_config WHERE id = 'default' LIMIT 1
    `

    if (rows.length > 0) {
      const themeConfig = rows[0].config

      // Solo exponemos el nombre de la tienda por seguridad
      return NextResponse.json({
        shopName: themeConfig.shopName || "Granito Management app",
      })
    }

    return NextResponse.json({
      shopName: "Granito Management app",
    })
  } catch (error) {
    console.error("Error al obtener la configuración pública del tema:", error)
    return NextResponse.json({
      shopName: "Granito Management app",
    })
  }
}
