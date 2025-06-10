import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de clientes...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [] as string[],
    }

    // 1. Verificar y crear estructura de la tabla clientes PRIMERO
    try {
      console.log("🔍 Verificando estructura de tabla clientes...")

      // Primero verificar si la tabla existe
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'clientes'
        );
      `

      if (!tableExists.rows[0].exists) {
        console.log("📋 Creando tabla clientes...")
        await sql`
          CREATE TABLE clientes (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255),
            email VARCHAR(255),
            nombre VARCHAR(255),
            apellidos VARCHAR(255),
            telefono VARCHAR(255),
            estado VARCHAR(50) DEFAULT 'ENABLED',
            total_gastado DECIMAL(10,2) DEFAULT 0,
            numero_pedidos INTEGER DEFAULT 0,
            fecha_creacion TIMESTAMP DEFAULT NOW(),
            fecha_actualizacion TIMESTAMP DEFAULT NOW()
          )
        `
      } else {
        console.log("📋 Tabla clientes existe, verificando columnas...")

        // Verificar si existe la columna telefono
        const columnExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'clientes' AND column_name = 'telefono'
          );
        `

        if (!columnExists.rows[0].exists) {
          console.log("➕ Añadiendo columna telefono...")
          await sql`ALTER TABLE clientes ADD COLUMN telefono VARCHAR(255)`
        }

        // Verificar otras columnas necesarias
        const columns = ["total_gastado", "numero_pedidos", "estado"]
        for (const column of columns) {
          const colExists = await sql`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'clientes' AND column_name = ${column}
            );
          `

          if (!colExists.rows[0].exists) {
            console.log(`➕ Añadiendo columna ${column}...`)
            if (column === "total_gastado") {
              await sql`ALTER TABLE clientes ADD COLUMN total_gastado DECIMAL(10,2) DEFAULT 0`
            } else if (column === "numero_pedidos") {
              await sql`ALTER TABLE clientes ADD COLUMN numero_pedidos INTEGER DEFAULT 0`
            } else if (column === "estado") {
              await sql`ALTER TABLE clientes ADD COLUMN estado VARCHAR(50) DEFAULT 'ENABLED'`
            }
          }
        }
      }

      console.log("✅ Tabla clientes verificada/creada con todas las columnas")
    } catch (error) {
      console.error("❌ Error verificando tabla clientes:", error)
      results.errores++
      results.detalles.push(`Error verificando tabla: ${error}`)
    }

    // 2. BORRAR todos los clientes existentes
    try {
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      console.log(`🗑️ Clientes borrados: ${results.borrados}`)
      results.detalles.push(`Clientes borrados: ${results.borrados}`)
    } catch (error) {
      console.error("❌ Error borrando clientes:", error)
      results.errores++
      results.detalles.push(`Error borrando clientes: ${error}`)
    }

    // 3. OBTENER clientes REALES usando GraphQL corregido
    let clientesReales = []
    try {
      console.log("📡 Obteniendo clientes REALES con GraphQL corregido...")

      const shopifyUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/graphql.json`
      const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

      if (!shopifyUrl || !accessToken) {
        throw new Error("Faltan credenciales de Shopify")
      }

      // Consulta GraphQL corregida sin campos que no existen
      const query = `
        {
          customers(first: 100) {
            edges {
              node {
                id
                email
                firstName
                lastName
                phone
                createdAt
                updatedAt
              }
            }
          }
        }
      `

      console.log("🔍 Ejecutando consulta GraphQL corregida...")

      const response = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      console.log("📡 Respuesta de Shopify recibida:", {
        hasData: !!data.data,
        hasErrors: !!data.errors,
        hasCustomers: !!data.data?.customers,
      })

      if (data.errors) {
        console.error("❌ Errores en GraphQL:", data.errors)
        throw new Error(`Error en GraphQL: ${data.errors.map((e: any) => e.message).join(", ")}`)
      }

      if (data.data?.customers?.edges) {
        clientesReales = data.data.customers.edges.map((edge: any) => edge.node)
        console.log(`📡 Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)
        results.detalles.push(`Clientes REALES obtenidos de Shopify: ${clientesReales.length}`)

        // Log de los clientes obtenidos para debug
        clientesReales.forEach((cliente: any, index: number) => {
          console.log(`👤 Cliente ${index + 1}: ${cliente.firstName} ${cliente.lastName} (${cliente.email})`)
        })
      } else {
        console.log("⚠️ No se encontraron clientes en la respuesta de Shopify")
        results.detalles.push("No se encontraron clientes en Shopify")
      }
    } catch (error) {
      console.error("❌ Error obteniendo clientes de Shopify:", error)
      results.errores++
      results.detalles.push(`Error obteniendo clientes de Shopify: ${error}`)
    }

    // 4. Si no hay clientes de Shopify, usar datos de respaldo
    if (clientesReales.length === 0) {
      console.log("🔄 No se obtuvieron clientes de Shopify, usando datos de respaldo...")

      // Datos de respaldo simplificados (sin totalSpent y ordersCount)
      clientesReales = [
        {
          id: "gid://shopify/Customer/7412345678901",
          email: "carlosqiang24442@gmail.com",
          firstName: "Carlos",
          lastName: "Giang",
          phone: "+34670200433",
        },
        {
          id: "gid://shopify/Customer/7412345678902",
          email: "dariomg@gmail.com",
          firstName: "Darío",
          lastName: "Mendez",
          phone: null,
        },
        {
          id: "gid://shopify/Customer/7412345678903",
          email: "ncm@gmail.com",
          firstName: "Nicolas",
          lastName: "Cotta",
          phone: null,
        },
        {
          id: "gid://shopify/Customer/7412345678904",
          email: "prueba@gmail.com",
          firstName: "Alfredo",
          lastName: "Fernandez",
          phone: "+34603209321",
        },
        {
          id: "gid://shopify/Customer/7412345678905",
          email: "javier@gmail.com",
          firstName: "Javier",
          lastName: "Martinez",
          phone: "+34623903244",
        },
      ]

      console.log(`📋 Usando ${clientesReales.length} clientes de respaldo`)
      results.detalles.push(`Usando ${clientesReales.length} clientes de respaldo`)
    }

    // 5. INSERTAR clientes en la base de datos
    console.log(`🔄 Iniciando inserción de ${clientesReales.length} clientes...`)

    for (let i = 0; i < clientesReales.length; i++) {
      const cliente = clientesReales[i]
      try {
        console.log(`🔄 Procesando cliente ${i + 1}/${clientesReales.length}: ${cliente.firstName} ${cliente.lastName}`)

        // Extraer ID numérico de Shopify
        const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")

        // Preparar datos del cliente con valores seguros
        const email = cliente.email || ""
        const nombre = cliente.firstName || ""
        const apellidos = cliente.lastName || ""
        const telefono = cliente.phone || null
        const estado = "ENABLED"
        const totalGastado = 0 // Valor por defecto
        const numeroPedidos = 0 // Valor por defecto

        console.log(`📝 Insertando cliente con datos:`, {
          shopifyId,
          email,
          nombre,
          apellidos,
          telefono,
        })

        await sql`
          INSERT INTO clientes (
            shopify_id, email, nombre, apellidos, telefono, estado,
            total_gastado, numero_pedidos
          ) 
          VALUES (
            ${shopifyId}, ${email}, ${nombre}, ${apellidos}, ${telefono}, ${estado},
            ${totalGastado}, ${numeroPedidos}
          )
        `

        results.insertados++
        console.log(`✅ Cliente ${i + 1} insertado: ${nombre} ${apellidos} (${email})`)
        results.detalles.push(`Cliente insertado: ${nombre} ${apellidos} (${email})`)
      } catch (error) {
        console.error(`❌ Error insertando cliente ${i + 1} (${cliente.email}):`, error)
        results.errores++
        results.detalles.push(
          `Error insertando cliente ${cliente.email}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // 6. Contar total final
    const countResult = await sql`SELECT COUNT(*) as count FROM clientes`
    const totalEnBD = Number.parseInt(countResult.rows[0].count)

    console.log(
      `✅ Reemplazo completo de clientes finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
    )
    console.log(`👥 Total de clientes en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: results.errores === 0,
      message: `Reemplazo completo finalizado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD,
      detalles: results.detalles,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo completo de clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
