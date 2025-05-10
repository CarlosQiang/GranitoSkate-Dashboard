"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: "20px" }}>Error del servidor</h1>
          <p style={{ marginBottom: "20px" }}>Ha ocurrido un error. Por favor, intenta de nuevo más tarde.</p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              backgroundColor: "#d29a43",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
