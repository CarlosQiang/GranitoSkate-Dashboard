import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa...")
    console.log("📊 Datos recibidos:", {
      productos: dashboardData.allProducts?.length || 0,
      pedidos: dashboardData.allOrders?.length || 0,
      clientes: dashboardData.allCustomers?.length || 0,
      colecciones: dashboardData.allCollections?.length || 0,
      promociones: dashboardData.allPromotions?.length || 0,
    })

    // Verificar si hay datos para sincronizar
    if (
      (!dashboardData.allProducts || dashboardData.allProducts.length === 0) &&
      (!dashboardData.allOrders || dashboardData.allOrders.length === 0) &&
      (!dashboardData.allCustomers || dashboardData.allCustomers.length === 0) &&
      (!dashboardData.allCollections || dashboardData.allCollections.length === 0) &&
      (!dashboardData.allPromotions || dashboardData.allPromotions.length === 0)
    ) {
      return NextResponse.json({
        success: false,
        message: "No hay datos para sincronizar",
        results: {},
        totalInsertados: 0,
      })
    }

    const results = {
      limpieza: { productos: 0, pedidos: 0, clientes: 0, colecciones: 0, promociones: 0 },
      productos: { insertados: 0, errores: 0 },
      pedidos: { insertados: 0, errores: 0 },
      clientes: { insertados: 0, errores: 0 },
      colecciones: { insertados: 0, errores: 0 },
      promociones: { insertados: 0, errores: 0 },
      configuracion: { guardada: false },
      seo: { guardado: false },
      personalizacion: { guardada: false },
    }

    // PASO 1: LIMPIAR TABLAS EXISTENTES
    console.log("🧹 Limpiando datos existentes...")

    try {
      // Limpiar relaciones primero
      await sql`DELETE FROM productos_colecciones`

      // Limpiar tablas principales
      const productosResult = await sql`DELETE FROM productos`
      results.limpieza.productos = productosResult.rowCount || 0

      const pedidosResult = await sql`DELETE FROM pedidos`
      results.limpieza.pedidos = pedidosResult.rowCount || 0

      const clientesResult = await sql`DELETE FROM clientes`
      results.limpieza.clientes = clientesResult.rowCount || 0

      const coleccionesResult = await sql`DELETE FROM colecciones`
      results.limpieza.colecciones = coleccionesResult.rowCount || 0

      const promocionesResult = await sql`DELETE FROM promociones`
      results.limpieza.promociones = promocionesResult.rowCount || 0

      console.log("✅ Limpieza completada:", results.limpieza)
    } catch (error) {
      console.error("❌ Error durante la limpieza:", error)
    }

    // PASO 2: INSERTAR PRODUCTOS
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts) && dashboardData.allProducts.length > 0) {
      console.log(`📦 Sincronizando ${dashboardData.allProducts.length} productos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          if (!producto.id) {
            console.warn("⚠️ Producto sin ID:", producto)
            results.productos.errores++
            continue
          }

          // Extraer ID limpio
          const shopifyId = String(producto.id).replace("gid://shopify/Product/", "")

          // Valores por defecto seguros
          const titulo = producto.title || `Producto ${shopifyId}`
          const descripcion = producto.description || ""
          const estado = producto.status || "ACTIVE"
          const precio = Number.parseFloat(producto.price || "0")
          const inventario = Number.parseInt(producto.inventory || "0")
          const tipoProducto = producto.productType || "SKATEBOARD"
          const proveedor = producto.vendor || "GranitoSkate"
          const imagen = producto.image || null
          const handle = producto.handle || titulo.toLowerCase().replace(/\s+/g, "-")

          console.log(`📝 Insertando producto: ${titulo} (ID: ${shopifyId})`)

          await sql`
            INSERT INTO productos (
              shopify_id, 
              titulo, 
              descripcion, 
              estado, 
              precio_base, 
              inventario_disponible,
              tipo_producto, 
              proveedor, 
              imagen_destacada_url, 
              url_handle,
              publicado,
              creado_en, 
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${titulo},
              ${descripcion},
              ${estado},
              ${precio},
              ${inventario},
              ${tipoProducto},
              ${proveedor},
              ${imagen},
              ${handle},
              ${true},
              NOW(),
              NOW()
            )
          `
          results.productos.insertados++
        } catch (error) {
          console.error(`❌ Error insertando producto:`, error)
          results.productos.errores++
        }
      }
      console.log(
        `✅ Productos sincronizados: ${results.productos.insertados} insertados, ${results.productos.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay productos para sincronizar")
    }

    // PASO 3: INSERTAR CLIENTES
    if (
      dashboardData.allCustomers &&
      Array.isArray(dashboardData.allCustomers) &&
      dashboardData.allCustomers.length > 0
    ) {
      console.log(`👥 Sincronizando ${dashboardData.allCustomers.length} clientes...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          if (!cliente.id) {
            console.warn("⚠️ Cliente sin ID:", cliente)
            results.clientes.errores++
            continue
          }

          const shopifyId = String(cliente.id).replace("gid://shopify/Customer/", "")
          const email = cliente.email || `cliente-${shopifyId}@example.com`
          const nombre = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim() || "Cliente"
          const telefono = cliente.phone || null
          const estado = cliente.state || "ENABLED"
          const totalPedidos = Number.parseInt(cliente.numberOfOrders || "0")
          const totalGastado = Number.parseFloat(cliente.totalSpent || "0")

          console.log(`📝 Insertando cliente: ${email} (ID: ${shopifyId})`)

          await sql`
            INSERT INTO clientes (
              shopify_id,
              email,
              nombre,
              telefono,
              estado,
              total_pedidos,
              total_gastado,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${email},
              ${nombre},
              ${telefono},
              ${estado},
              ${totalPedidos},
              ${totalGastado},
              NOW(),
              NOW()
            )
          `
          results.clientes.insertados++
        } catch (error) {
          console.error(`❌ Error insertando cliente:`, error)
          results.clientes.errores++
        }
      }
      console.log(
        `✅ Clientes sincronizados: ${results.clientes.insertados} insertados, ${results.clientes.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay clientes para sincronizar")
    }

    // PASO 4: INSERTAR PEDIDOS
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders) && dashboardData.allOrders.length > 0) {
      console.log(`🛒 Sincronizando ${dashboardData.allOrders.length} pedidos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          if (!pedido.id) {
            console.warn("⚠️ Pedido sin ID:", pedido)
            results.pedidos.errores++
            continue
          }

          const shopifyId = String(pedido.id).replace("gid://shopify/Order/", "")
          const numeroPedido = pedido.name || `#${shopifyId}`

          // Manejar diferentes estructuras de datos para el total
          let total = 0
          if (pedido.totalPriceSet && pedido.totalPriceSet.shopMoney && pedido.totalPriceSet.shopMoney.amount) {
            total = Number.parseFloat(pedido.totalPriceSet.shopMoney.amount)
          } else if (pedido.total) {
            total = Number.parseFloat(pedido.total)
          }

          // Manejar diferentes estructuras para la moneda
          let moneda = "EUR"
          if (pedido.totalPriceSet && pedido.totalPriceSet.shopMoney && pedido.totalPriceSet.shopMoney.currencyCode) {
            moneda = pedido.totalPriceSet.shopMoney.currencyCode
          } else if (pedido.currency) {
            moneda = pedido.currency
          }

          // Manejar diferentes estructuras para el email del cliente
          let emailCliente = ""
          if (pedido.customer && pedido.customer.email) {
            emailCliente = pedido.customer.email
          } else if (pedido.email) {
            emailCliente = pedido.email
          }

          // Manejar diferentes estructuras para el estado
          const estado = pedido.displayFulfillmentStatus || pedido.fulfillmentStatus || "PENDING"
          const estadoFinanciero = pedido.displayFinancialStatus || pedido.financialStatus || "PENDING"

          console.log(`📝 Insertando pedido: ${numeroPedido} (ID: ${shopifyId})`)

          await sql`
            INSERT INTO pedidos (
              shopify_id,
              numero_pedido,
              total,
              moneda,
              email_cliente,
              estado,
              estado_financiero,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${numeroPedido},
              ${total},
              ${moneda},
              ${emailCliente},
              ${estado},
              ${estadoFinanciero},
              NOW(),
              NOW()
            )
          `
          results.pedidos.insertados++
        } catch (error) {
          console.error(`❌ Error insertando pedido:`, error)
          results.pedidos.errores++
        }
      }
      console.log(
        `✅ Pedidos sincronizados: ${results.pedidos.insertados} insertados, ${results.pedidos.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay pedidos para sincronizar")
    }

    // PASO 5: INSERTAR COLECCIONES
    if (
      dashboardData.allCollections &&
      Array.isArray(dashboardData.allCollections) &&
      dashboardData.allCollections.length > 0
    ) {
      console.log(`📚 Sincronizando ${dashboardData.allCollections.length} colecciones...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          if (!coleccion.id) {
            console.warn("⚠️ Colección sin ID:", coleccion)
            results.colecciones.errores++
            continue
          }

          const shopifyId = String(coleccion.id).replace("gid://shopify/Collection/", "")
          const titulo = coleccion.title || `Colección ${shopifyId}`
          const descripcion = coleccion.description || ""
          const handle = coleccion.handle || titulo.toLowerCase().replace(/\s+/g, "-")

          // Manejar diferentes estructuras para el conteo de productos
          let productosCount = 0
          if (coleccion.productsCount && typeof coleccion.productsCount === "object" && coleccion.productsCount.count) {
            productosCount = Number.parseInt(coleccion.productsCount.count)
          } else if (coleccion.productsCount) {
            productosCount = Number.parseInt(String(coleccion.productsCount))
          }

          // Manejar diferentes estructuras para la imagen
          let imagenUrl = null
          if (coleccion.image && coleccion.image.url) {
            imagenUrl = coleccion.image.url
          } else if (coleccion.image) {
            imagenUrl = coleccion.image
          }

          console.log(`📝 Insertando colección: ${titulo} (ID: ${shopifyId})`)

          await sql`
            INSERT INTO colecciones (
              shopify_id,
              titulo,
              descripcion,
              url_handle,
              imagen_url,
              productos_count,
              publicado,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${titulo},
              ${descripcion},
              ${handle},
              ${imagenUrl},
              ${productosCount},
              ${true},
              NOW(),
              NOW()
            )
          `
          results.colecciones.insertados++
        } catch (error) {
          console.error(`❌ Error insertando colección:`, error)
          results.colecciones.errores++
        }
      }
      console.log(
        `✅ Colecciones sincronizadas: ${results.colecciones.insertados} insertados, ${results.colecciones.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay colecciones para sincronizar")
    }

    // PASO 6: INSERTAR PROMOCIONES
    if (
      dashboardData.allPromotions &&
      Array.isArray(dashboardData.allPromotions) &&
      dashboardData.allPromotions.length > 0
    ) {
      console.log(`🎯 Sincronizando ${dashboardData.allPromotions.length} promociones...`)

      for (const promocion of dashboardData.allPromotions) {
        try {
          if (!promocion.id) {
            console.warn("⚠️ Promoción sin ID:", promocion)
            results.promociones.errores++
            continue
          }

          const shopifyId = String(promocion.id)
            .replace("gid://shopify/DiscountNode/", "")
            .replace("gid://shopify/DiscountCodeNode/", "")

          // Extraer título con fallbacks
          let titulo = "Promoción sin título"
          if (promocion.title) {
            titulo = promocion.title
          } else if (promocion.codeDiscount && promocion.codeDiscount.title) {
            titulo = promocion.codeDiscount.title
          }

          // Extraer descripción con fallbacks
          let descripcion = ""
          if (promocion.summary) {
            descripcion = promocion.summary
          } else if (promocion.codeDiscount && promocion.codeDiscount.summary) {
            descripcion = promocion.codeDiscount.summary
          }

          // Extraer tipo con fallbacks
          let tipo = "PERCENTAGE"
          if (promocion.discount && promocion.discount.discountClass) {
            tipo = promocion.discount.discountClass
          } else if (promocion.type) {
            tipo = promocion.type
          }

          // Extraer valor con fallbacks
          let valor = 0
          if (promocion.discount && promocion.discount.customerGets && promocion.discount.customerGets.value) {
            if (promocion.discount.customerGets.value.percentage) {
              valor = Number.parseFloat(promocion.discount.customerGets.value.percentage)
            } else if (
              promocion.discount.customerGets.value.discountAmount &&
              promocion.discount.customerGets.value.discountAmount.amount
            ) {
              valor = Number.parseFloat(promocion.discount.customerGets.value.discountAmount.amount)
            }
          } else if (promocion.value) {
            valor = Number.parseFloat(String(promocion.value))
          }

          // Extraer código con fallbacks
          let codigo = null
          if (
            promocion.codeDiscount &&
            promocion.codeDiscount.codes &&
            promocion.codeDiscount.codes.nodes &&
            promocion.codeDiscount.codes.nodes.length > 0
          ) {
            codigo = promocion.codeDiscount.codes.nodes[0].code
          } else if (promocion.code) {
            codigo = promocion.code
          }

          // Extraer estado
          const activo = promocion.status === "ACTIVE" || promocion.status === "active"

          console.log(`📝 Insertando promoción: ${titulo} (ID: ${shopifyId})`)

          await sql`
            INSERT INTO promociones (
              shopify_id,
              titulo,
              descripcion,
              tipo,
              valor,
              codigo,
              activo,
              fecha_inicio,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${titulo},
              ${descripcion},
              ${tipo},
              ${valor},
              ${codigo},
              ${activo},
              NOW(),
              NOW(),
              NOW()
            )
          `
          results.promociones.insertados++
        } catch (error) {
          console.error(`❌ Error insertando promoción:`, error)
          results.promociones.errores++
        }
      }
      console.log(
        `✅ Promociones sincronizadas: ${results.promociones.insertados} insertados, ${results.promociones.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay promociones para sincronizar")
    }

    // PASO 7: GUARDAR CONFIGURACIONES
    try {
      const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "granito-skate"
      const hasToken = !!process.env.SHOPIFY_ACCESS_TOKEN

      await sql`
        INSERT INTO configuracion_shopify (
          dominio_tienda, token_configurado, activa, creado_en, actualizado_en
        ) VALUES (
          ${shopDomain}, ${hasToken}, ${hasToken}, NOW(), NOW()
        )
        ON CONFLICT (dominio_tienda) 
        DO UPDATE SET 
          token_configurado = ${hasToken},
          activa = ${hasToken},
          actualizado_en = NOW()
      `
      results.configuracion.guardada = true
      console.log("✅ Configuración de Shopify guardada")
    } catch (error) {
      console.error("❌ Error guardando configuración:", error)
    }

    // PASO 8: GUARDAR METADATOS SEO
    try {
      await sql`
        INSERT INTO metadatos_seo (
          tipo_entidad, titulo, descripcion, palabras_clave, creado_en, actualizado_en
        ) VALUES (
          'tienda', 'GranitoSkate - Tienda de Skate Online',
          'Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios.',
          'skate,skateboard,tienda,online,granito', NOW(), NOW()
        )
        ON CONFLICT (tipo_entidad) 
        DO UPDATE SET actualizado_en = NOW()
      `
      results.seo.guardado = true
      console.log("✅ Metadatos SEO guardados")
    } catch (error) {
      console.error("❌ Error guardando SEO:", error)
    }

    // PASO 9: GUARDAR CONFIGURACIÓN DE PERSONALIZACIÓN
    try {
      const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "granito-skate"

      await sql`
        INSERT INTO theme_configs (
          shop_id, config_name, primary_color, secondary_color, accent_color,
          font_family, heading_font_family, border_radius, button_style, card_style,
          sidebar_style, enable_animations, animation_speed, enable_dark_mode,
          prefer_dark_mode, shop_name, created_at, updated_at
        ) VALUES (
          ${shopId}, 'default', '#D4A574', '#8B4513', '#FF6B35',
          'Inter, sans-serif', 'Inter, sans-serif', 'medium', 'solid', 'raised',
          'default', true, 'normal', true, false, 'GranitoSkate', NOW(), NOW()
        )
        ON CONFLICT (shop_id, config_name) 
        DO UPDATE SET 
          updated_at = NOW(),
          shop_name = 'GranitoSkate'
      `

      await sql`
        INSERT INTO theme_settings (shop_id, setting_key, setting_value, created_at, updated_at)
        VALUES 
          (${shopId}, 'logo_url', '/logo-granito.png', NOW(), NOW()),
          (${shopId}, 'favicon_url', '/favicon.ico', NOW(), NOW()),
          (${shopId}, 'brand_colors_initialized', 'true', NOW(), NOW())
        ON CONFLICT (shop_id, setting_key) 
        DO UPDATE SET 
          updated_at = NOW()
      `

      results.personalizacion.guardada = true
      console.log("✅ Configuración de personalización guardada")
    } catch (error) {
      console.error("❌ Error guardando personalización:", error)
    }

    // PASO 10: REGISTRAR ACTIVIDAD
    const totalInsertados =
      results.productos.insertados +
      results.pedidos.insertados +
      results.clientes.insertados +
      results.colecciones.insertados +
      results.promociones.insertados

    try {
      await sql`
        INSERT INTO registros_actividad (
          accion, tipo_entidad, resultado, descripcion, creado_en
        ) VALUES (
          'sincronizacion_completa', 'sistema', 'completado',
          'Sincronización completa: ' || ${totalInsertados} || ' registros insertados',
          NOW()
        )
      `
    } catch (error) {
      console.error("❌ Error registrando actividad:", error)
    }

    console.log("✅ Sincronización completada exitosamente")
    console.log("📊 Resultados finales:", results)

    return NextResponse.json({
      success: true,
      message: "Sincronización completa exitosa",
      results,
      totalInsertados,
    })
  } catch (error) {
    console.error("❌ Error en sincronización:", error)
    return NextResponse.json(
      {
        error: "Error en la sincronización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
