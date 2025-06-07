import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { registrarEvento } from "@/lib/db/repositories/registro-repository"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando sincronización de datos de la tienda...")

    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // PASO 1: Verificar conexión a la base de datos
    try {
      await sql`SELECT 1`
      console.log("✅ Conexión a BD verificada")
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    // PASO 2: Obtener información de la tienda desde Shopify
    let tiendaInfo = {}
    try {
      console.log("🔍 Obteniendo información de la tienda desde Shopify...")

      const shopifyUrl = process.env.SHOPIFY_API_URL
      const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

      if (!shopifyUrl || !accessToken) {
        throw new Error("Credenciales de Shopify no configuradas")
      }

      const response = await fetch(`${shopifyUrl}/admin/api/2023-10/shop.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error de Shopify: ${response.status}`)
      }

      const data = await response.json()
      tiendaInfo = data.shop || {}
      console.log("📊 Información de la tienda obtenida:", tiendaInfo)

      // Registrar evento
      await registrarEvento("SYNC", "Información de la tienda obtenida de Shopify", {
        tienda: tiendaInfo.name,
        dominio: tiendaInfo.domain,
      })
    } catch (error) {
      console.error("❌ Error obteniendo información de la tienda:", error)

      // Registrar evento de error
      await registrarEvento("ERROR", "Error obteniendo información de la tienda", {
        error: error instanceof Error ? error.message : "Error desconocido",
      })

      // Continuar con el proceso aunque falle esta parte
    }

    // PASO 3: Crear o actualizar la configuración de la tienda
    try {
      console.log("🔄 Guardando configuración de la tienda en la base de datos...")

      // Crear tabla si no existe
      await sql`
        CREATE TABLE IF NOT EXISTS configuracion_shopify (
          id SERIAL PRIMARY KEY,
          nombre_tienda VARCHAR(255),
          url_tienda VARCHAR(255),
          clave_api VARCHAR(255),
          secreto_api VARCHAR(255),
          token_acceso TEXT,
          activo BOOLEAN DEFAULT true,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Verificar si ya existe configuración
      const configExistente = await sql`SELECT id FROM configuracion_shopify LIMIT 1`

      if (configExistente.rows.length > 0) {
        // Actualizar configuración existente
        await sql`
          UPDATE configuracion_shopify SET
            nombre_tienda = ${tiendaInfo.name || null},
            url_tienda = ${tiendaInfo.domain || null},
            activo = true
          WHERE id = ${configExistente.rows[0].id}
        `
        console.log("✅ Configuración de la tienda actualizada")

        // Registrar evento
        await registrarEvento("SYNC", "Configuración de la tienda actualizada", {
          tienda: tiendaInfo.name,
          dominio: tiendaInfo.domain,
        })
      } else {
        // Crear nueva configuración
        await sql`
          INSERT INTO configuracion_shopify (
            nombre_tienda, url_tienda, clave_api, secreto_api, token_acceso, activo
          ) VALUES (
            ${tiendaInfo.name || null},
            ${tiendaInfo.domain || null},
            ${process.env.SHOPIFY_API_KEY || null},
            ${process.env.SHOPIFY_API_SECRET || null},
            ${process.env.SHOPIFY_ACCESS_TOKEN || null},
            true
          )
        `
        console.log("✅ Configuración de la tienda creada")

        // Registrar evento
        await registrarEvento("SYNC", "Configuración de la tienda creada", {
          tienda: tiendaInfo.name,
          dominio: tiendaInfo.domain,
        })
      }
    } catch (error) {
      console.error("❌ Error guardando configuración de la tienda:", error)

      // Registrar evento de error
      await registrarEvento("ERROR", "Error guardando configuración de la tienda", {
        error: error instanceof Error ? error.message : "Error desconocido",
      })

      // Continuar con el proceso aunque falle esta parte
    }

    // PASO 4: Guardar metadatos SEO de la tienda
    try {
      console.log("🔄 Guardando metadatos SEO de la tienda...")

      // Crear tabla si no existe
      await sql`
        CREATE TABLE IF NOT EXISTS metadatos_seo (
          id SERIAL PRIMARY KEY,
          tipo_entidad VARCHAR(50),
          id_entidad VARCHAR(255),
          titulo VARCHAR(255),
          descripcion TEXT,
          palabras_clave TEXT,
          datos_adicionales JSONB,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Verificar si ya existen metadatos para la tienda
      const metadatosExistentes = await sql`
        SELECT id FROM metadatos_seo 
        WHERE tipo_entidad = 'tienda' AND id_entidad = 'principal'
        LIMIT 1
      `

      const seoData = {
        titulo: tiendaInfo.name || "Tienda Online",
        descripcion: tiendaInfo.description || "Tienda online con los mejores productos",
        palabras_clave: "tienda, online, ecommerce, productos",
        datos_adicionales: JSON.stringify({
          url: tiendaInfo.domain,
          email: tiendaInfo.email,
          telefono: tiendaInfo.phone,
          direccion: tiendaInfo.address1,
          ciudad: tiendaInfo.city,
          pais: tiendaInfo.country_name,
        }),
      }

      if (metadatosExistentes.rows.length > 0) {
        // Actualizar metadatos existentes
        await sql`
          UPDATE metadatos_seo SET
            titulo = ${seoData.titulo},
            descripcion = ${seoData.descripcion},
            palabras_clave = ${seoData.palabras_clave},
            datos_adicionales = ${seoData.datos_adicionales}
          WHERE id = ${metadatosExistentes.rows[0].id}
        `
        console.log("✅ Metadatos SEO de la tienda actualizados")

        // Registrar evento
        await registrarEvento("SYNC", "Metadatos SEO de la tienda actualizados")
      } else {
        // Crear nuevos metadatos
        await sql`
          INSERT INTO metadatos_seo (
            tipo_entidad, id_entidad, titulo, descripcion, palabras_clave, datos_adicionales
          ) VALUES (
            'tienda',
            'principal',
            ${seoData.titulo},
            ${seoData.descripcion},
            ${seoData.palabras_clave},
            ${seoData.datos_adicionales}
          )
        `
        console.log("✅ Metadatos SEO de la tienda creados")

        // Registrar evento
        await registrarEvento("SYNC", "Metadatos SEO de la tienda creados")
      }
    } catch (error) {
      console.error("❌ Error guardando metadatos SEO de la tienda:", error)

      // Registrar evento de error
      await registrarEvento("ERROR", "Error guardando metadatos SEO de la tienda", {
        error: error instanceof Error ? error.message : "Error desconocido",
      })

      // Continuar con el proceso aunque falle esta parte
    }

    return NextResponse.json({
      success: true,
      message: "Datos de la tienda sincronizados correctamente",
      tiendaInfo,
    })
  } catch (error) {
    console.error("❌ Error general en sincronización de datos de la tienda:", error)

    // Registrar evento de error
    await registrarEvento("ERROR", "Error general en sincronización de datos de la tienda", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
        details: "Error en la sincronización de datos de la tienda",
      },
      { status: 500 },
    )
  }
}
