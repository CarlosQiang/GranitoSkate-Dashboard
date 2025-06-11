"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PromotionsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la versión en español
    router.push("/dashboard/promociones")
  }, [router])

  return null
}
