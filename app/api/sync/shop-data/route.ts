import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { guardarConfiguracionTienda, guardarMetadatosSeo } from "@/lib/db/repositories/seo-repository"
import { registrarEvento } from "@/lib/db/repositories/registro-repository"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log("🏪 Iniciando sincronización de datos de la tienda...")

    // Registrar inicio de sincronización
    await registrarEvento({
      tipo: "sync_shop_data",
      descripcion: "Iniciando sincronización de datos de la tienda",
      detalles: { usuario: session.user?.email },
    })

    const resultados = {
      configuracion_tienda: { actualizado: false, error: null as string | null },
      seo_tienda: { actualizado: false, error: null as string | null },
      informacion_negocio: { actualizado: false, error: null as string | null },
    }

    // 1. Obtener información básica de la tienda desde Shopify
    try {
      console.log("📋 Obteniendo información básica de la tienda...")

      const shopQuery = `
        query getShop {
          shop {
            id
            name
            description
            url
            primaryDomain {
              url
              host
            }
            contactEmail
            customerEmail
            phone
            address {
              address1
              address2
              city
              province
              country
              zip
            }
            currencyCode
            timezoneAbbreviation
            plan {
              displayName
            }
          }
        }
      `

      const shopResponse = await fetch("/api/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: shopQuery }),
      })

      if (shopResponse.ok) {
        const shopData = await shopResponse.json()
        const shop = shopData.data?.shop

        if (shop) {
          // Guardar configuración básica de la tienda
          const configuracionTienda = {
            nombre_tienda: shop.name || "Granito Skate Shop",
            url_tienda: shop.primaryDomain?.url || shop.url || "",
            clave_api: process.env.SHOPIFY_API_KEY || "",
            secreto_api: process.env.SHOPIFY_API_SECRET || "",
            token_acceso: process.env.SHOPIFY_ACCESS_TOKEN || "",
            activo: true,
            datos_negocio_local: {
              email: shop.contactEmail || shop.customerEmail,
              telefono: shop.phone,
              direccion: shop.address,
              moneda: shop.currencyCode,
              zona_horaria: shop.timezoneAbbreviation,
              plan: shop.plan?.displayName,
            },
          }

          const guardadoConfig = await guardarConfiguracionTienda(configuracionTienda)
          resultados.configuracion_tienda.actualizado = guardadoConfig

          // Guardar SEO básico de la tienda
          const seoTienda = {
            tipo_entidad: "shop",
            id_entidad: "main",
            titulo: shop.name || "Granito Skate Shop - Tienda de skate online",
            descripcion:
              shop.description ||
              "Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios de las mejores marcas.",
            palabras_clave: ["skate", "skateboard", "tienda", "online", shop.name?.toLowerCase()].filter(Boolean),
            datos_adicionales: {
              url_canonical: shop.primaryDomain?.url,
              email_contacto: shop.contactEmail,
              telefono: shop.phone,
              direccion_completa: shop.address,
            },
          }

          const guardadoSeo = await guardarMetadatosSeo(seoTienda)
          resultados.seo_tienda.actualizado = guardadoSeo

          console.log("✅ Información de la tienda sincronizada correctamente")
        }
      }
    } catch (error) {
      console.error("❌ Error sincronizando información de la tienda:", error)
      resultados.configuracion_tienda.error = error instanceof Error ? error.message : "Error desconocido"
    }

    // 2. Obtener metafields de SEO de la tienda (si existen)
    try {
      console.log("🔍 Obteniendo metafields de SEO...")

      const metafieldsQuery = `
        query getShopMetafields {
          shop {
            metafields(first: 50, namespace: "seo") {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
      `

      const metafieldsResponse = await fetch("/api/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: metafieldsQuery }),
      })

      if (metafieldsResponse.ok) {
        const metafieldsData = await metafieldsResponse.json()
        const metafields = metafieldsData.data?.shop?.metafields?.edges || []

        if (metafields.length > 0) {
          console.log(`📝 Encontrados ${metafields.length} metafields de SEO`)

          // Procesar metafields y actualizar SEO
          const seoData: any = {}
          metafields.forEach((edge: any) => {
            const metafield = edge.node
            seoData[metafield.key] = metafield.value
          })

          // Actualizar metadatos SEO con información de Shopify
          if (Object.keys(seoData).length > 0) {
            const seoActualizado = {
              tipo_entidad: "shop",
              id_entidad: "main",
              titulo: seoData.title || "Granito Skate Shop - Tienda de skate online",
              descripcion: seoData.description || "Tienda especializada en productos de skate",
              palabras_clave: seoData.keywords
                ? seoData.keywords.split(",").map((k: string) => k.trim())
                : ["skate", "skateboard"],
              datos_adicionales: {
                ...seoData,
                sincronizado_desde_shopify: true,
                fecha_sincronizacion: new Date().toISOString(),
              },
            }

            const guardadoSeoShopify = await guardarMetadatosSeo(seoActualizado)
            resultados.informacion_negocio.actualizado = guardadoSeoShopify
          }
        }
      }
    } catch (error) {
      console.error("❌ Error obteniendo metafields de SEO:", error)
      resultados.informacion_negocio.error = error instanceof Error ? error.message : "Error desconocido"
    }

    // Registrar resultado de la sincronización
    await registrarEvento({
      tipo: "sync_shop_data",
      descripcion: "Sincronización de datos de la tienda completada",
      detalles: { resultados, usuario: session.user?.email },
    })

    const totalActualizados = Object.values(resultados).filter((r) => r.actualizado).length
    const totalErrores = Object.values(resultados).filter((r) => r.error).length

    console.log("🏪 Sincronización de datos de la tienda completada:", resultados)

    return NextResponse.json({
      success: true,
      message: `Datos de la tienda sincronizados: ${totalActualizados} actualizados, ${totalErrores} errores`,
      resultados,
      totalActualizados,
      totalErrores,
    })
  } catch (error) {
    console.error("❌ Error en sincronización de datos de la tienda:", error)

    await registrarEvento({
      tipo: "sync_shop_data",
      descripcion: "Error en sincronización de datos de la tienda",
      detalles: { error: error instanceof Error ? error.message : "Error desconocido" },
    })

    return NextResponse.json(
      {
        error: "Error en la sincronización de datos de la tienda",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
