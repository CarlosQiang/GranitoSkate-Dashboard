import { Loader2 } from "lucide-react"

export default function OverviewLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#c59d45]" />
      <span className="ml-2 text-lg">Cargando panel de control...</span>
    </div>
  )
}
