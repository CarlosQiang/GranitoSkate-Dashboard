"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-[#c59d45]">Error</h1>
      <h2 className="mt-4 text-2xl font-semibold">Algo salió mal</h2>
      <p className="mt-2 text-gray-500">Lo sentimos, ha ocurrido un error inesperado.</p>
      <Button onClick={() => reset()} className="mt-8 bg-[#c59d45] hover:bg-[#c59d45]/90 text-white">
        Intentar de nuevo
      </Button>
    </div>
  )
}
