export async function createPriceList(data: any) {
  try {
    console.log("🔄 Creando promoción via API...")

    const response = await fetch("/api/db/promociones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error HTTP: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Error al crear promoción")
    }

    return result.promocion
  } catch (error) {
    console.error("❌ Error en createPriceList:", error)
    throw error
  }
}
