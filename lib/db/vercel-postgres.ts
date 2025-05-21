import { sql } from "@vercel/postgres"

// Funciones de utilidad para operaciones comunes
export async function findAll(table: string) {
  const result = await sql`SELECT * FROM ${sql.identifier(table)}`
  return result.rows
}

export async function findById(table: string, id: number) {
  const result = await sql`SELECT * FROM ${sql.identifier(table)} WHERE id = ${id}`
  return result.rows[0] || null
}

export async function findByField(table: string, field: string, value: any) {
  const result = await sql`
    SELECT * FROM ${sql.identifier(table)} 
    WHERE ${sql.identifier(field)} = ${value}
  `
  return result.rows[0] || null
}

export async function findOne(table: string, conditions: Record<string, any>) {
  const keys = Object.keys(conditions)
  const values = Object.values(conditions)

  // Construir la consulta dinámicamente
  let query = `SELECT * FROM "${table}" WHERE `
  const whereClauses = keys.map((key, index) => `"${key}" = $${index + 1}`).join(" AND ")
  query += whereClauses + " LIMIT 1"

  const result = await sql.query(query, values)
  return result.rows[0] || null
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data)
  const values = Object.values(data)

  // Construir la consulta dinámicamente
  let query = `INSERT INTO "${table}" (`
  query += keys.map((key) => `"${key}"`).join(", ")
  query += ") VALUES ("
  query += keys.map((_, index) => `$${index + 1}`).join(", ")
  query += ") RETURNING *"

  const result = await sql.query(query, values)
  return result.rows[0]
}

export async function update(table: string, id: number, data: Record<string, any>) {
  const keys = Object.keys(data)
  const values = [...Object.values(data), id]

  // Construir la consulta dinámicamente
  let query = `UPDATE "${table}" SET `
  query += keys.map((key, index) => `"${key}" = $${index + 1}`).join(", ")
  query += ` WHERE id = $${values.length} RETURNING *`

  const result = await sql.query(query, values)
  return result.rows[0]
}

export async function remove(table: string, id: number) {
  await sql`DELETE FROM ${sql.identifier(table)} WHERE id = ${id}`
  return { success: true }
}

export async function logSyncEvent(
  tipo_entidad: string,
  entidad_id = "UNKNOWN",
  accion: string,
  resultado: string,
  mensaje: string,
  detalles: any = {},
) {
  return insert("registro_sincronizacion", {
    tipo_entidad,
    entidad_id,
    accion,
    resultado,
    mensaje,
    detalles: JSON.stringify(detalles),
    fecha: new Date(),
  })
}

export async function executeQuery(query: string, params: any[] = []) {
  const result = await sql.query(query, params)
  return result.rows
}

export default {
  findAll,
  findById,
  findByField,
  insert,
  update,
  remove,
  logSyncEvent,
  executeQuery,
  sql,
}
