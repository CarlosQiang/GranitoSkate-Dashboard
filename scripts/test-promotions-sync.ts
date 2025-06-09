// Script para probar la sincronización de promociones
console.log("🧪 Iniciando prueba de sincronización de promociones...")

// 1. Probar el endpoint de diagnóstico
try {
  console.log("📋 Ejecutando diagnóstico...")
  const diagnosticResponse = await fetch("/api/sync/promotions-test")
  const diagnosticData = await diagnosticResponse.json()

  console.log("📊 Resultado del diagnóstico:")
  console.log(JSON.stringify(diagnosticData, null, 2))

  if (diagnosticData.success) {
    console.log("✅ Diagnóstico completado exitosamente")

    // 2. Si el diagnóstico es exitoso, probar la sincronización
    console.log("🔄 Iniciando sincronización de prueba...")
    const syncResponse = await fetch("/api/sync/promotions-replace", {
      method: "POST",
    })

    const syncData = await syncResponse.json()
    console.log("📊 Resultado de la sincronización:")
    console.log(JSON.stringify(syncData, null, 2))

    if (syncData.success) {
      console.log("✅ Sincronización completada exitosamente")
      console.log(`📊 Total en BD: ${syncData.totalEnBD}`)
    } else {
      console.error("❌ Error en sincronización:", syncData.error)
    }
  } else {
    console.error("❌ Error en diagnóstico:", diagnosticData.error)
  }
} catch (error) {
  console.error("❌ Error ejecutando prueba:", error)
}
