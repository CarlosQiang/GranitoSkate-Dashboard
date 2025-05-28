import { ServicioBaseDatos } from "./base-datos.servicio"
import { query } from "@/lib/db"

export class ServicioColeccion extends ServicioBaseDatos {
  static async listarPorUsuario(emailUsuario: string, pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite

      const resultado = await query(
        `
        SELECT * FROM colecciones 
        WHERE email_usuario = $1 
        ORDER BY orden_clasificacion, creado_en DESC 
        LIMIT $2 OFFSET $3
      `,
        [emailUsuario, limite, offset],
      )

      const total = await this.contarRegistros("colecciones", emailUsuario)

      return {
        colecciones: resultado.rows,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      }
    } catch (error) {
      console.error("Error listando colecciones por usuario:", error)
      throw error
    }
  }

  static async crear(datosColeccion: any) {
    try {
      const coleccion = await this.crear("colecciones", {
        ...datosColeccion,
        creado_en: new Date(),
        actualizado_en: new Date(),
      })

      await this.registrarActividad(
        datosColeccion.email_usuario,
        "crear_coleccion",
        `Colección creada: ${datosColeccion.nombre}`,
        { coleccion_id: coleccion.id },
      )

      return coleccion
    } catch (error) {
      console.error("Error creando colección:", error)
      throw error
    }
  }

  static async obtenerPorId(id: string) {
    return await this.obtenerPorId("colecciones", id)
  }

  static async actualizar(id: string, datos: any) {
    try {
      const coleccion = await this.actualizar("colecciones", id, datos)

      if (coleccion && datos.email_usuario) {
        await this.registrarActividad(
          datos.email_usuario,
          "actualizar_coleccion",
          `Colección actualizada: ${coleccion.nombre}`,
          { coleccion_id: id },
        )
      }

      return coleccion
    } catch (error) {
      console.error("Error actualizando colección:", error)
      throw error
    }
  }

  static async eliminar(id: string, emailUsuario: string) {
    try {
      const coleccion = await this.obtenerPorId("colecciones", id)
      const eliminado = await this.eliminar("colecciones", id)

      if (eliminado && coleccion) {
        await this.registrarActividad(emailUsuario, "eliminar_coleccion", `Colección eliminada: ${coleccion.nombre}`, {
          coleccion_id: id,
        })
      }

      return eliminado
    } catch (error) {
      console.error("Error eliminando colección:", error)
      throw error
    }
  }

  static async obtenerProductosDeColeccion(idColeccion: string) {
    try {
      const resultado = await query(
        `
        SELECT p.* FROM productos p
        INNER JOIN productos_colecciones pc ON p.id = pc.id_producto
        WHERE pc.id_coleccion = $1
        ORDER BY pc.posicion, p.nombre
      `,
        [idColeccion],
      )

      return resultado.rows
    } catch (error) {
      console.error("Error obteniendo productos de colección:", error)
      throw error
    }
  }

  static async agregarProductoAColeccion(idProducto: string, idColeccion: string, posicion?: number) {
    try {
      const datos = {
        id_producto: idProducto,
        id_coleccion: idColeccion,
        posicion: posicion || 0,
      }

      return await this.crear("productos_colecciones", datos)
    } catch (error) {
      console.error("Error agregando producto a colección:", error)
      throw error
    }
  }

  static async removerProductoDeColeccion(idProducto: string, idColeccion: string) {
    try {
      const resultado = await query(
        `
        DELETE FROM productos_colecciones 
        WHERE id_producto = $1 AND id_coleccion = $2
        RETURNING id
      `,
        [idProducto, idColeccion],
      )

      return resultado.rows.length > 0
    } catch (error) {
      console.error("Error removiendo producto de colección:", error)
      throw error
    }
  }

  static async sincronizarConShopify(emailUsuario: string, datosShopify: any) {
    try {
      const coleccionExistente = await query(
        `
        SELECT * FROM colecciones 
        WHERE shopify_id = $1 AND email_usuario = $2
      `,
        [datosShopify.id, emailUsuario],
      )

      let coleccion
      if (coleccionExistente.rows.length > 0) {
        coleccion = await this.actualizar("colecciones", coleccionExistente.rows[0].id, {
          nombre: datosShopify.title,
          descripcion: datosShopify.body_html,
          url_imagen: datosShopify.image?.src,
          datos_shopify: JSON.stringify(datosShopify),
          esta_publicado: datosShopify.published,
        })
      } else {
        coleccion = await this.crear("colecciones", {
          email_usuario: emailUsuario,
          shopify_id: datosShopify.id.toString(),
          nombre: datosShopify.title,
          descripcion: datosShopify.body_html,
          url_imagen: datosShopify.image?.src,
          datos_shopify: JSON.stringify(datosShopify),
          esta_publicado: datosShopify.published,
        })
      }

      return coleccion
    } catch (error) {
      console.error("Error sincronizando colección con Shopify:", error)
      throw error
    }
  }
}
