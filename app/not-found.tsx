export default function NotFound() {
  return (
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
      <h1 style={{ marginBottom: "20px" }}>Página no encontrada</h1>
      <p style={{ marginBottom: "20px" }}>Lo sentimos, la página que estás buscando no existe.</p>
      <a
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#d29a43",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        Volver al inicio
      </a>
    </div>
  )
}
