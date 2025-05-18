import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"
import { sql } from "@vercel/postgres"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

// Función para registrar la sincronización
async function registrarSincronizacion(
  tipoEntidad: string,
  entidadId: string | null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      ) VALUES (
        ${tipoEntidad}, ${entidadId}, ${accion}, ${resultado}, ${mensaje}, 
        ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
    `
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener productos de Shopify
async function obtenerProductosDeShopify(limit = 10) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "iniciado",
      `Obteniendo productos de Shopify (límite: ${limit})`,
    )

    // Consulta GraphQL para obtener productos
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify: respuesta vacía o inválida")
    }

    // Registrar éxito de la obtención
    const productCount = response.data.products.edges.length
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${productCount} productos de Shopify`,
    )

    return response.data.products.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "productos",
      null,
      "consulta",
      "error",
      `Error al obtener productos de Shopify: ${error.message}`,
    )
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    console.log(`Iniciando sincronización de productos (límite: ${limit})...`)

    // Verificar la conexión a la base de datos
    try {
      await sql`SELECT NOW()`
      console.log("Conexión a la base de datos establecida")
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al conectar con la base de datos",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Verificar si las tablas existen
    try {
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'productos'
        );
      `

      if (!tableExists.rows[0].exists) {
        console.log("La tabla 'productos' no existe, creándola...")

        // Crear la tabla productos
        await sql`
          CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255),
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            tipo_producto VARCHAR(100),
            proveedor VARCHAR(100),
            estado VARCHAR(50),
            publicado BOOLEAN DEFAULT false,
            destacado BOOLEAN DEFAULT false,
            etiquetas TEXT[],
            imagen_destacada_url TEXT,
            precio_base DECIMAL(10, 2),
            precio_comparacion DECIMAL(10, 2),
            sku VARCHAR(100),
            codigo_barras VARCHAR(100),
            inventario_disponible INTEGER,
            politica_inventario VARCHAR(50),
            requiere_envio BOOLEAN DEFAULT true,
            peso DECIMAL(10, 2),
            unidad_peso VARCHAR(10),
            seo_titulo VARCHAR(255),
            seo_descripcion TEXT,
            url_handle VARCHAR(255),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_publicacion TIMESTAMP,
            ultima_sincronizacion TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
        `

        console.log("Tabla 'productos' creada correctamente")

        // Crear la tabla variantes_producto
        await sql`
          CREATE TABLE IF NOT EXISTS variantes_producto (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255),
            producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
            titulo VARCHAR(255) NOT NULL,
            precio DECIMAL(10, 2),
            precio_comparacion DECIMAL(10, 2),
            sku VARCHAR(100),
            codigo_barras VARCHAR(100),
            inventario_disponible INTEGER,
            politica_inventario VARCHAR(50),
            requiere_envio BOOLEAN DEFAULT true,
            peso DECIMAL(10, 2),
            unidad_peso VARCHAR(10),
            opcion1_nombre VARCHAR(100),
            opcion1_valor VARCHAR(100),
            opcion2_nombre VARCHAR(100),
            opcion2_valor VARCHAR(100),
            opcion3_nombre VARCHAR(100),
            opcion3_valor VARCHAR(100),
            posicion INTEGER,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ultima_sincronizacion TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_variantes_producto_shopify_id ON variantes_producto(shopify_id);
          CREATE INDEX IF NOT EXISTS idx_variantes_producto_producto_id ON variantes_producto(producto_id);
        `

        console.log("Tabla 'variantes_producto' creada correctamente")

        // Crear la tabla imagenes_producto
        await sql`
          CREATE TABLE IF NOT EXISTS imagenes_producto (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255),
            producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
            variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE SET NULL,
            url TEXT NOT NULL,
            texto_alternativo VARCHAR(255),
            posicion INTEGER,
            es_destacada BOOLEAN DEFAULT false,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ultima_sincronizacion TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_imagenes_producto_shopify_id ON imagenes_producto(shopify_id);
          CREATE INDEX IF NOT EXISTS idx_imagenes_producto_producto_id ON imagenes_producto(producto_id);
        `

        console.log("Tabla 'imagenes_producto' creada correctamente")

        // Crear la tabla registro_sincronizacion si no existe
        await sql`
          CREATE TABLE IF NOT EXISTS registro_sincronizacion (
            id SERIAL PRIMARY KEY,
            tipo_entidad VARCHAR(50) NOT NULL,
            entidad_id VARCHAR(255),
            accion VARCHAR(50) NOT NULL,
            resultado VARCHAR(50) NOT NULL,
            mensaje TEXT,
            detalles JSONB,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_registro_sincronizacion_tipo_entidad ON registro_sincronizacion(tipo_entidad);
          CREATE INDEX IF NOT EXISTS idx_registro_sincronizacion_fecha ON registro_sincronizacion(fecha);
        `

        console.log("Tabla 'registro_sincronizacion' creada correctamente")
      }
    } catch (error) {
      console.error("Error al verificar o crear tablas:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error al verificar o crear tablas",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Obtener productos de Shopify
    const productos = await obtenerProductosDeShopify(limit)
    console.log(`Se obtuvieron ${productos.length} productos de Shopify`)

    const resultados = {
      total: productos.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Registrar inicio de sincronización
    await registrarSincronizacion(
      "productos",
      null,
      "sincronizar",
      "iniciado",
      `Iniciando sincronización de ${productos.length} productos`,
    )

    for (const productoData of productos) {
      try {
        // Extraer el ID de Shopify
        const shopifyId = productoData.id.split("/").pop() || ""
        console.log(`Procesando producto: ${productoData.title} (ID: ${shopifyId})`)

        // Verificar si el producto ya existe
        const productoExistente = await sql`
          SELECT id FROM productos WHERE shopify_id = ${shopifyId}
        `

        // Preparar los datos del producto
        const etiquetas = productoData.tags ? productoData.tags.split(", ") : []

        // Preparar los datos del producto
        const productoObj = {
          shopify_id: shopifyId,
          titulo: productoData.title || "",
          descripcion: productoData.description || "",
          tipo_producto: productoData.productType || "",
          proveedor: productoData.vendor || "",
          estado: (productoData.status || "").toLowerCase(),
          publicado: productoData.status === "ACTIVE",
          destacado: false,
          etiquetas: etiquetas,
          imagen_destacada_url: productoData.images?.edges?.length > 0 ? productoData.images.edges[0].node.url : "",
          precio_base:
            productoData.variants?.edges?.length > 0 ? Number.parseFloat(productoData.variants.edges[0].node.price) : 0,
          precio_comparacion:
            productoData.variants?.edges?.length > 0 && productoData.variants.edges[0].node.compareAtPrice
              ? Number.parseFloat(productoData.variants.edges[0].node.compareAtPrice)
              : null,
          sku: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.sku : "",
          codigo_barras: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.barcode : "",
          inventario_disponible:
            productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.inventoryQuantity || 0 : 0,
          politica_inventario:
            productoData.variants?.edges?.length > 0
              ? productoData.variants.edges[0].node.inventoryPolicy?.toLowerCase() || ""
              : "",
          requiere_envio: true,
          peso: productoData.variants?.edges?.length > 0 ? productoData.variants.edges[0].node.weight || 0 : 0,
          unidad_peso:
            productoData.variants?.edges?.length > 0
              ? productoData.variants.edges[0].node.weightUnit?.toLowerCase() || "kg"
              : "kg",
          url_handle: productoData.handle || "",
          fecha_publicacion: productoData.publishedAt ? new Date(productoData.publishedAt) : null,
        }

        let producto

        // Crear o actualizar el producto
        if (productoExistente.rows.length > 0) {
          // Actualizar producto existente
          const productoId = productoExistente.rows[0].id

          await sql`
            UPDATE productos SET
              titulo = ${productoObj.titulo},
              descripcion = ${productoObj.descripcion},
              tipo_producto = ${productoObj.tipo_producto},
              proveedor = ${productoObj.proveedor},
              estado = ${productoObj.estado},
              publicado = ${productoObj.publicado},
              destacado = ${productoObj.destacado},
              etiquetas = ${productoObj.etiquetas},
              imagen_destacada_url = ${productoObj.imagen_destacada_url},
              precio_base = ${productoObj.precio_base},
              precio_comparacion = ${productoObj.precio_comparacion},
              sku = ${productoObj.sku},
              codigo_barras = ${productoObj.codigo_barras},
              inventario_disponible = ${productoObj.inventario_disponible},
              politica_inventario = ${productoObj.politica_inventario},
              requiere_envio = ${productoObj.requiere_envio},
              peso = ${productoObj.peso},
              unidad_peso = ${productoObj.unidad_peso},
              url_handle = ${productoObj.url_handle},
              fecha_actualizacion = NOW(),
              ultima_sincronizacion = NOW()
            WHERE id = ${productoId}
            RETURNING *
          `

          producto = { id: productoId }
          resultados.actualizados++
          await registrarSincronizacion(
            "productos",
            shopifyId,
            "actualizar",
            "exito",
            `Producto actualizado: ${productoObj.titulo}`,
          )
          console.log(`Producto actualizado: ${productoObj.titulo}`)
        } else {
          // Crear nuevo producto
          const result = await sql`
            INSERT INTO productos (
              shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
              publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
              precio_comparacion, sku, codigo_barras, inventario_disponible,
              politica_inventario, requiere_envio, peso, unidad_peso, url_handle,
              fecha_publicacion, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
            ) VALUES (
              ${productoObj.shopify_id},
              ${productoObj.titulo},
              ${productoObj.descripcion},
              ${productoObj.tipo_producto},
              ${productoObj.proveedor},
              ${productoObj.estado},
              ${productoObj.publicado},
              ${productoObj.destacado},
              ${productoObj.etiquetas},
              ${productoObj.imagen_destacada_url},
              ${productoObj.precio_base},
              ${productoObj.precio_comparacion},
              ${productoObj.sku},
              ${productoObj.codigo_barras},
              ${productoObj.inventario_disponible},
              ${productoObj.politica_inventario},
              ${productoObj.requiere_envio},
              ${productoObj.peso},
              ${productoObj.unidad_peso},
              ${productoObj.url_handle},
              ${productoObj.fecha_publicacion},
              NOW(), NOW(), NOW()
            ) RETURNING id
          `

          producto = { id: result.rows[0].id }
          resultados.creados++
          await registrarSincronizacion(
            "productos",
            shopifyId,
            "crear",
            "exito",
            `Producto creado: ${productoObj.titulo}`,
          )
          console.log(`Producto creado: ${productoObj.titulo}`)
        }

        // Procesar variantes si existen
        if (producto && productoData.variants?.edges) {
          // Eliminar variantes existentes para evitar duplicados
          await sql`DELETE FROM variantes_producto WHERE producto_id = ${producto.id}`

          for (const varianteData of productoData.variants.edges) {
            const variante = varianteData.node
            const varianteShopifyId = variante.id.split("/").pop() || ""

            try {
              await sql`
                INSERT INTO variantes_producto (
                  shopify_id, producto_id, titulo, precio, precio_comparacion,
                  sku, codigo_barras, inventario_disponible, politica_inventario,
                  requiere_envio, peso, unidad_peso, posicion, fecha_creacion,
                  fecha_actualizacion, ultima_sincronizacion
                ) VALUES (
                  ${varianteShopifyId},
                  ${producto.id},
                  ${variante.title || ""},
                  ${Number.parseFloat(variante.price) || 0},
                  ${variante.compareAtPrice ? Number.parseFloat(variante.compareAtPrice) : null},
                  ${variante.sku || ""},
                  ${variante.barcode || ""},
                  ${variante.inventoryQuantity || 0},
                  ${variante.inventoryPolicy?.toLowerCase() || ""},
                  ${true},
                  ${variante.weight || 0},
                  ${variante.weightUnit?.toLowerCase() || "kg"},
                  ${1},
                  NOW(), NOW(), NOW()
                )
              `
            } catch (error) {
              console.error(`Error al crear variante para producto ${producto.id}:`, error)
              await registrarSincronizacion(
                "variantes",
                varianteShopifyId,
                "crear",
                "error",
                `Error al crear variante: ${error.message}`,
              )
            }
          }
        }

        // Procesar imágenes si existen
        if (producto && productoData.images?.edges) {
          // Eliminar imágenes existentes para evitar duplicados
          await sql`DELETE FROM imagenes_producto WHERE producto_id = ${producto.id}`

          for (let i = 0; i < productoData.images.edges.length; i++) {
            const imagenData = productoData.images.edges[i].node
            const imagenShopifyId = imagenData.id.split("/").pop() || ""

            try {
              await sql`
                INSERT INTO imagenes_producto (
                  shopify_id, producto_id, url, texto_alternativo,
                  posicion, es_destacada, fecha_creacion, fecha_actualizacion,
                  ultima_sincronizacion
                ) VALUES (
                  ${imagenShopifyId},
                  ${producto.id},
                  ${imagenData.url || ""},
                  ${imagenData.altText || ""},
                  ${i + 1},
                  ${i === 0},
                  NOW(), NOW(), NOW()
                )
              `
            } catch (error) {
              console.error(`Error al crear imagen para producto ${producto.id}:`, error)
              await registrarSincronizacion(
                "imagenes",
                imagenShopifyId,
                "crear",
                "error",
                `Error al crear imagen: ${error.message}`,
              )
            }
          }
        }

        resultados.detalles.push({
          id: shopifyId,
          titulo: productoObj.titulo,
          resultado: "exito",
        })
      } catch (error) {
        console.error("Error al sincronizar producto:", error)
        resultados.errores++
        resultados.detalles.push({
          id: productoData.id ? productoData.id.split("/").pop() : "",
          titulo: productoData.title || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })

        await registrarSincronizacion(
          "productos",
          productoData.id ? productoData.id.split("/").pop() : "",
          "sincronizar",
          "error",
          `Error al sincronizar producto: ${error.message}`,
          { error: error.message, stack: error.stack },
        )
      }
    }

    // Registrar finalización de sincronización
    await registrarSincronizacion(
      "productos",
      null,
      "sincronizar",
      "completado",
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    console.log(
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
