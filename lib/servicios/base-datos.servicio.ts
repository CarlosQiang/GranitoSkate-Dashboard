import { query } from "@/lib/db"

export class ServicioBaseDatos {
  // Métodos genéricos para cualquier tabla
  static async obtenerTodos(tabla: string, emailUsuario?: string) {
    try {
      let consulta = `SELECT * FROM ${tabla}`
      let parametros: any[] = []

      if (emailUsuario) {
        consulta += ` WHERE email_usuario = $1`
        parametros = [emailUsuario]
      }

      consulta += ` ORDER BY creado_en DESC`

      const resultado = await query(consulta, parametros)
      return resultado.rows
    } catch (error) {
      console.error(`Error obteniendo registros de ${tabla}:`, error)
      throw error
    }
  }

  static async obtenerPorId(tabla: string, id: string) {
    try {
      const resultado = await query(`SELECT * FROM ${tabla} WHERE id = $1`, [id])
      return resultado.rows[0] || null
    } catch (error) {
      console.error(`Error obteniendo registro por ID de ${tabla}:`, error)
      throw error
    }
  }

  static async crear(tabla: string, datos: any) {
    try {
      const campos = Object.keys(datos)
      const valores = Object.values(datos)
      const marcadores = campos.map((_, index) => `$${index + 1}`).join(", ")
      const camposStr = campos.join(", ")

      const consulta = `
        INSERT INTO ${tabla} (${camposStr}) 
        VALUES (${marcadores}) 
        RETURNING *
      `

      const resultado = await query(consulta, valores)
      return resultado.rows[0]
    } catch (error) {
      console.error(`Error creando registro en ${tabla}:`, error)
      throw error
    }
  }

  static async actualizar(tabla: string, id: string, datos: any) {
    try {
      const campos = Object.keys(datos)
      const valores = Object.values(datos)
      const actualizaciones = campos.map((campo, index) => `${campo} = $${index + 1}`).join(", ")

      const consulta = `
        UPDATE ${tabla} 
        SET ${actualizaciones}, actualizado_en = CURRENT_TIMESTAMP 
        WHERE id = $${campos.length + 1} 
        RETURNING *
      `

      const resultado = await query(consulta, [...valores, id])
      return resultado.rows[0] || null
    } catch (error) {
      console.error(`Error actualizando registro en ${tabla}:`, error)
      throw error
    }
  }

  static async eliminar(tabla: string, id: string) {
    try {
      const resultado = await query(`DELETE FROM ${tabla} WHERE id = $1 RETURNING id`, [id])
      return resultado.rows.length > 0
    } catch (error) {
      console.error(`Error eliminando registro de ${tabla}:`, error)
      throw error
    }
  }

  static async buscar(tabla: string, campo: string, valor: any, emailUsuario?: string) {
    try {
      let consulta = `SELECT * FROM ${tabla} WHERE ${campo} ILIKE $1`
      const parametros: any[] = [`%${valor}%`]

      if (emailUsuario) {
        consulta += ` AND email_usuario = $2`
        parametros.push(emailUsuario)
      }

      consulta += ` ORDER BY creado_en DESC`

      const resultado = await query(consulta, parametros)
      return resultado.rows
    } catch (error) {
      console.error(`Error buscando en ${tabla}:`, error)
      throw error
    }
  }

  static async contarRegistros(tabla: string, emailUsuario?: string) {
    try {
      let consulta = `SELECT COUNT(*) as total FROM ${tabla}`
      let parametros: any[] = []

      if (emailUsuario) {
        consulta += ` WHERE email_usuario = $1`
        parametros = [emailUsuario]
      }

      const resultado = await query(consulta, parametros)
      return Number.parseInt(resultado.rows[0].total)
    } catch (error) {
      console.error(`Error contando registros de ${tabla}:`, error)
      throw error
    }
  }

  // Método para registrar actividad
  static async registrarActividad(emailUsuario: string, accion: string, descripcion: string, datosAdicionales?: any) {
    try {
      const datos = {
        email_usuario: emailUsuario,
        accion,
        descripcion,
        datos_adicionales: JSON.stringify(datosAdicionales || {}),
      }

      return await this.crear("registros_actividad", datos)
    } catch (error) {
      console.error("Error registrando actividad:", error)
      // No lanzar error para no interrumpir la operación principal
    }
  }
}
