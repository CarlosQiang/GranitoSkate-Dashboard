import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa...")

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

      console.log("✅ Limpieza completada")
    } catch (error) {
      console.error("❌ Error durante la limpieza:", error)
    }

    // PASO 2: INSERTAR PRODUCTOS
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts)) {
      console.log(`📦 Sincronizando ${dashboardData.allProducts.length} productos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          if (!producto.id || !producto.title) {
            results.productos.errores++
            continue
          }

          const shopifyId = producto.id.replace("gid://shopify/Product/", "")

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
              creado_en, 
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${producto.title},
              ${producto.description || ""},
              ${producto.status || "ACTIVE"},
              ${Number.parseFloat(producto.price || "0")},
              ${Number.parseInt(producto.inventory || "0")},
              ${producto.productType || "SKATEBOARD"},
              ${producto.vendor || "GranitoSkate"},
              ${producto.image || null},
              ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
              NOW(),
              NOW()
            )
          `
          results.productos.insertados++
        } catch (error) {
          console.error(`Error insertando producto:`, error)
          results.productos.errores++
        }
      }
    }

    // PASO 3: INSERTAR PEDIDOS
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders)) {
      console.log(`🛒 Sincronizando ${dashboardData.allOrders.length} pedidos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          if (!pedido.id) {
            results.pedidos.errores++
            continue
          }

          const shopifyId = pedido.id.replace("gid://shopify/Order/", "")

          await sql`
            INSERT INTO pedidos (
              shopify_id,
              numero_pedido,
              total,
              moneda,
              email_cliente,
              estado,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${pedido.name || `#${shopifyId}`},
              ${Number.parseFloat(pedido.total || "0")},
              ${pedido.currency || "EUR"},
              ${pedido.customer?.email || ""},
              ${pedido.fulfillmentStatus || "PENDING"},
              NOW(),
              NOW()
            )
          `
          results.pedidos.insertados++
        } catch (error) {
          console.error(`Error insertando pedido:`, error)
          results.pedidos.errores++
        }
      }
    }

    // PASO 4: INSERTAR CLIENTES
    if (dashboardData.allCustomers && Array.isArray(dashboardData.allCustomers)) {
      console.log(`👥 Sincronizando ${dashboardData.allCustomers.length} clientes...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          if (!cliente.id || !cliente.email) {
            results.clientes.errores++
            continue
          }

          const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")
          const nombre = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim() || "Cliente"

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
              ${cliente.email},
              ${nombre},
              ${cliente.phone || null},
              ${cliente.state || "ENABLED"},
              ${Number.parseInt(cliente.numberOfOrders || "0")},
              ${Number.parseFloat(cliente.totalSpent || "0")},
              NOW(),
              NOW()
            )
          `
          results.clientes.insertados++
        } catch (error) {
          console.error(`Error insertando cliente:`, error)
          results.clientes.errores++
        }
      }
    }

    // PASO 5: INSERTAR COLECCIONES
    if (dashboardData.allCollections && Array.isArray(dashboardData.allCollections)) {
      console.log(`📚 Sincronizando ${dashboardData.allCollections.length} colecciones...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          if (!coleccion.id || !coleccion.title) {
            results.colecciones.errores++
            continue
          }

          const shopifyId = coleccion.id.replace("gid://shopify/Collection/", "")

          await sql`
            INSERT INTO colecciones (
              shopify_id,
              titulo,
              descripcion,
              url_handle,
              imagen_url,
              productos_count,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${coleccion.title},
              ${coleccion.description || ""},
              ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
              ${coleccion.image || null},
              ${Number.parseInt(coleccion.productsCount || "0")},
              NOW(),
              NOW()
            )
          `
          results.colecciones.insertados++
        } catch (error) {
          console.error(`Error insertando colección:`, error)
          results.colecciones.errores++
        }
      }
    }

    // PASO 6: INSERTAR PROMOCIONES
    if (dashboardData.allPromotions && Array.isArray(dashboardData.allPromotions)) {
      console.log(`🎯 Sincronizando ${dashboardData.allPromotions.length} promociones...`)

      for (const promocion of dashboardData.allPromotions) {
        try {
          if (!promocion.id || !promocion.title) {
            results.promociones.errores++
            continue
          }

          const shopifyId = promocion.id.replace("gid://shopify/DiscountNode/", "")

          await sql`
            INSERT INTO promociones (
              shopify_id,
              titulo,
              descripcion,
              tipo,
              valor,
              codigo,
              activo,
              creado_en,
              actualizado_en
            ) VALUES (
              ${shopifyId},
              ${promocion.title},
              ${promocion.summary || ""},
              ${promocion.type || "PERCENTAGE"},
              ${Number.parseFloat(promocion.value || "0")},
              ${promocion.code || null},
              ${promocion.status === "ACTIVE"},
              NOW(),
              NOW()
            )
          `
          results.promociones.insertados++
        } catch (error) {
          console.error(`Error insertando promoción:`, error)
          results.promociones.errores++
        }
      }
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
    } catch (error) {
      console.error("Error guardando configuración:", error)
    }

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
    } catch (error) {
      console.error("Error guardando SEO:", error)
    }

    try {
      await sql`
        INSERT INTO theme_configs (
          shop_id, config_name, primary_color, secondary_color, accent_color,
          font_family, enable_dark_mode, shop_name, created_at, updated_at
        ) VALUES (
          'granito-skate', 'default', '#D4A574', '#8B4513', '#FF6B35',
          'Inter', true, 'GranitoSkate', NOW(), NOW()
        )
        ON CONFLICT (shop_id, config_name) 
        DO UPDATE SET updated_at = NOW()
      `
      results.personalizacion.guardada = true
    } catch (error) {
      console.error("Error guardando personalización:", error)
    }

    // PASO 8: REGISTRAR ACTIVIDAD
    const totalInsertados =
      results.productos.insertados +
      results.pedidos.insertados +
      results.clientes.insertados +
      results.colecciones.insertados +
      results.promociones.insertados

    await sql`
      INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES (
        'sincronizacion_completa', 'sistema', 'completado',
        'Sincronización completa: ' || ${totalInsertados} || ' registros insertados',
        NOW()
      )
    `

    console.log("✅ Sincronización completada exitosamente")

    return NextResponse.json({
      success: true,
      message: "Sincronización completa exitosa",
      results,
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
