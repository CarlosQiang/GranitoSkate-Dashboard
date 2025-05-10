export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand"></div>
        <p className="text-lg font-medium text-gray-700">Cargando...</p>
      </div>
    </div>
  )
}
