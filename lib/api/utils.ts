export function slugify(text: string): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Eliminar guiones duplicados
    .trim() // Eliminar espacios al inicio y final
}
