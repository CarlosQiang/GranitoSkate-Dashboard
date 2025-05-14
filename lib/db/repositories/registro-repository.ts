import { executeQuery } from "../neon"

export async function getAllRegistros(limit = 100, offset = 0) {
  const query = "SELECT * FROM registro_sincronizacion ORDER BY fecha DESC LIMIT $1 OFFSET $2"
  return executeQuery(query, [limit, offset])
}

export async function getRegistrosByTipoEntidad(tipoEntidad: string, limit = 100, offset = 0) {
  const query = "SELECT * FROM registro_sincronizacion WHERE tipo_entidad = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3"
  return executeQuery(query, [tipoEntidad, limit, offset])
}

export async function getRegistrosByResultado(resultado: string, limit = 100, offset = 0) {
  const query = "SELECT * FROM registro_sincronizacion WHERE resultado = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3"
  return executeQuery(query, [resultado, limit, offset])
}

export async function getRegistrosByAccion(accion: string, limit = 100, offset = 0) {
  const query = "SELECT * FROM registro_sincronizacion WHERE accion = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3"
  return executeQuery(query, [accion, limit, offset])
}

export async function getRegistrosByFecha(fechaInicio: Date, fechaFin: Date, limit = 100, offset = 0) {
  const query =
    "SELECT * FROM registro_sincronizacion WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC LIMIT $3 OFFSET $4"
  return executeQuery(query, [fechaInicio, fechaFin, limit, offset])
}

export async function getRegistrosCount() {
  const result = await executeQuery("SELECT COUNT(*) as total FROM registro_sincronizacion")
  return Number.parseInt(result[0].total)
}

export async function getRegistrosCountByTipoEntidad(tipoEntidad: string) {
  const result = await executeQuery("SELECT COUNT(*) as total FROM registro_sincronizacion WHERE tipo_entidad = $1", [
    tipoEntidad,
  ])
  return Number.parseInt(result[0].total)
}

export async function getRegistrosCountByResultado(resultado: string) {
  const result = await executeQuery("SELECT COUNT(*) as total FROM registro_sincronizacion WHERE resultado = $1", [
    resultado,
  ])
  return Number.parseInt(result[0].total)
}
