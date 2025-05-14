import { Pool } from "pg"

// Configuración para conexión a Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Funciones de utilidad para operaciones comunes
export async function findAll(table: string) {
  return executeQuery(`SELECT * FROM ${table}`)
}

export async function findById(table: string, id: number) {
  return executeQuery(`SELECT * FROM ${table} WHERE id = $1`, [id])
}

export async function findOne(table: string, conditions: Record<string, any>) {
  const keys = Object.keys(conditions)
  const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(" AND ")
  const values = Object.values(conditions)

  const rows = await executeQuery(`SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`, values)
  return rows.length > 0 ? rows[0] : null
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data)
  const columns = keys.join(", ")
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ")
  const values = Object.values(data)

  const result = await executeQuery(`INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values)

  return result[0]
}

export async function update(table: string, id: number, data: Record<string, any>) {
  const keys = Object.keys(data)
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ")
  const values = [...Object.values(data), id]

  const result = await executeQuery(`UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`, values)

  return result[0]
}

export async function remove(table: string, id: number) {
  await executeQuery(`DELETE FROM ${table} WHERE id = $1`, [id])
  return { success: true }
}

export async function logSyncEvent(
  tipo_entidad: string,
  entidad_id: string,
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
