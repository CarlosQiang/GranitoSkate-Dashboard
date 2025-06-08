"use client"

import { SyncAllData } from "@/components/sync-all-data"
import { SyncPromotionsDashboard } from "@/components/sync-promotions-dashboard"
import { useState, useCallback } from "react"

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      {/* Sincronización específica de promociones */}
      <div className="mb-6">
        <SyncPromotionsDashboard onSyncComplete={handleRefresh} />
      </div>

      {/* Sincronización completa existente */}
      <SyncAllData onSyncComplete={handleRefresh} />
    </div>
  )
}
