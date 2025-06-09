import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Ejecutando diagnóstico de promociones...")

    // 1. Verificar variables de entorno
    const envCheck = {
      SHOPIFY_SHOP_DOMAIN: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
      SHOPIFY_ACCESS_TOKEN: !!process.env.SHOPIFY_ACCESS_TOKEN,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    console.log("📋 Variables de entorno:", envCheck)

    // 2. Verificar conexión a la base de datos
    let dbConnection = false
    let tableExists = false
    let recordCount = 0

    try {
      const testQuery = await query("SELECT 1 as test")
      dbConnection = testQuery.rows.length > 0
      console.log("✅ Conexión a BD exitosa")

      // Verificar si la tabla existe
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'promociones'
        )
      `)
      tableExists = tableCheck.rows[0].exists
      console.log(`📊 Tabla promociones existe: ${tableExists}`)

      if (tableExists) {
        const countResult = await query("SELECT COUNT(*) as total FROM promociones")
        recordCount = Number.parseInt(countResult.rows[0].total)
        console.log(`📊 Registros en promociones: ${recordCount}`)
      }
    } catch (dbError) {
      console.error("❌ Error de BD:", dbError)
    }

    // 3. Verificar conexión a Shopify
    let shopifyConnection = false
    let shopifyPromotions = 0

    try {
      if (process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN) {
        const shopifyResponse = await fetch(
          `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
              query: `
                query {
                  discountNodes(first: 5) {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              `,
            }),
          },
        )

        if (shopifyResponse.ok) {
          const data = await shopifyResponse.json()
          shopifyConnection = !data.errors
          shopifyPromotions = data.data?.discountNodes?.edges?.length || 0
          console.log(`✅ Conexión a Shopify exitosa, ${shopifyPromotions} promociones encontradas`)
        }
      }
    } catch (shopifyError) {
      console.error("❌ Error de Shopify:", shopifyError)
    }

    return NextResponse.json({
      success: true,
      diagnostics: {
        environment: envCheck,
        database: {
          connection: dbConnection,
          tableExists: tableExists,
          recordCount: recordCount,
        },
        shopify: {
          connection: shopifyConnection,
          promotionsFound: shopifyPromotions,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en diagnóstico",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
