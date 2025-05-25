// Schema simplificado solo para administradores y logging
export type Administrador = {
  id?: number
  nombre_usuario: string
  correo_electronico: string
  contrasena: string
  nombre_completo?: string
  rol: string
  activo: boolean
  ultimo_acceso?: Date
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export type RegistroActividad = {
  id?: number
  usuario_id?: number
  usuario_nombre?: string
  accion: string
  entidad?: string
  entidad_id?: string
  descripcion?: string
  metadatos?: any
  ip_address?: string
  user_agent?: string
  resultado: "SUCCESS" | "ERROR" | "WARNING"
  error_mensaje?: string
  duracion_ms?: number
  fecha_creacion?: Date
}

export type SesionUsuario = {
  id?: number
  usuario_id: number
  session_token: string
  ip_address?: string
  user_agent?: string
  activa: boolean
  fecha_inicio?: Date
  fecha_fin?: Date
  ultima_actividad?: Date
}
