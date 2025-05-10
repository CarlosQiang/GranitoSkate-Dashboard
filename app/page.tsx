export default function Home() {
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
      <h1 style={{ marginBottom: "20px" }}>GranitoSkate Dashboard</h1>
      <p>Bienvenido al panel de administración.</p>
      <div style={{ marginTop: "20px" }}>
        <a
          href="/login"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#d29a43",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Iniciar sesión
        </a>
      </div>
    </div>
  )
}
