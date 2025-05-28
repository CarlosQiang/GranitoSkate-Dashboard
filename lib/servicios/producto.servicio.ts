import { ServicioBaseDatos } from "./base-datos.servicio"
import { query } from "@/lib/db"

export class ServicioProducto extends ServicioBaseDatos {
  static async listarPorUsuario(emailUsuario: string, pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite

      const resultado = await query(
        `
        SELECT * FROM productos 
        WHERE email_usuario = $1 
        ORDER BY creado_en DESC 
        LIMIT $2 OFFSET $3
      `,
        [emailUsuario, limite, offset],
      )

      const total = await this.contarRegistros("productos", emailUsuario)

      return {
        productos: resultado.rows,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      }
    } catch (error) {
      console.error("Error listando productos por usuario:", error)
      throw error
    }
  }

  static async crear(datosProducto: any) {
    try {
      const producto = await this.crear("productos", {
        ...datosProducto,
        creado_en: new Date(),
        actualizado_en: new Date(),
      })

      // Registrar actividad
      await this.registrarActividad(
        datosProducto.email_usuario,
        "crear_producto",
        `Producto creado: ${datosProducto.nombre}`,
        { producto_id: producto.id },
      )

      return producto
    } catch (error) {
      console.error("Error creando producto:", error)
      throw error
    }
  }

  static async obtenerPorId(id: string) {
    return await this.obtenerPorId("productos", id)
  }

  static async actualizar(id: string, datos: any) {
    try {
      const producto = await this.actualizar("productos", id, datos)

      if (producto && datos.email_usuario) {
        await this.registrarActividad(
          datos.email_usuario,
          "actualizar_producto",
          `Producto actualizado: ${producto.nombre}`,
          { producto_id: id },
        )
      }

      return producto
    } catch (error) {
      console.error("Error actualizando producto:", error)
      throw error
    }
  }

  static async eliminar(id: string, emailUsuario: string) {
    try {
      const producto = await this.obtenerPorId("productos", id)
      const eliminado = await this.eliminar("productos", id)

      if (eliminado && producto) {
        await this.registrarActividad(emailUsuario, "eliminar_producto", `Producto eliminado: ${producto.nombre}`, {
          producto_id: id,
        })
      }

      return eliminado
    } catch (error) {
      console.error("Error eliminando producto:", error)
      throw error
    }
  }

  static async buscar(emailUsuario: string, termino: string, pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite

      const resultado = await query(
        `
        SELECT * FROM productos 
        WHERE email_usuario = $1 
        AND (nombre ILIKE $2 OR descripcion ILIKE $2 OR sku ILIKE $2)
        ORDER BY creado_en DESC 
        LIMIT $3 OFFSET $4
      `,
        [emailUsuario, `%${termino}%`, limite, offset],
      )

      return {
        productos: resultado.rows,
        total: resultado.rows.length,
        pagina,
        limite,
      }
    } catch (error) {
      console.error("Error buscando productos:", error)
      throw error
    }
  }

  static async sincronizarConShopify(emailUsuario: string, datosShopify: any) {
    try {
      // Buscar si ya existe el producto por shopify_id
      const productoExistente = await query(
        `
        SELECT * FROM productos 
        WHERE shopify_id = $1 AND email_usuario = $2
      `,
        [datosShopify.id, emailUsuario],
      )

      let producto
      if (productoExistente.rows.length > 0) {
        // Actualizar producto existente
        producto = await this.actualizar("productos", productoExistente.rows[0].id, {
          nombre: datosShopify.title,
          descripcion: datosShopify.body_html,
          precio: datosShopify.variants?.[0]?.price,
          sku: datosShopify.variants?.[0]?.sku,
          cantidad_inventario: datosShopify.variants?.[0]?.inventory_quantity,
          url_imagen_principal: datosShopify.image?.src,
          datos_shopify: JSON.stringify(datosShopify),
          esta_publicado: datosShopify.status === "active",
        })
      } else {
        // Crear nuevo producto
        producto = await this.crear("productos", {
          email_usuario: emailUsuario,
          shopify_id: datosShopify.id.toString(),
          nombre: datosShopify.title,
          descripcion: datosShopify.body_html,
          precio: datosShopify.variants?.[0]?.price,
          sku: datosShopify.variants?.[0]?.sku,
          cantidad_inventario: datosShopify.variants?.[0]?.inventory_quantity,
          url_imagen_principal: datosShopify.image?.src,
          datos_shopify: JSON.stringify(datosShopify),
          esta_publicado: datosShopify.status === "active",
          estado: datosShopify.status === "active" ? "publicado" : "borrador",
        })
      }

      return producto
    } catch (error) {
      console.error("Error sincronizando producto con Shopify:", error)
      throw error
    }
  }
}
