"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pasos, Paso } from "@/components/ui/pasos"
import { FormularioTipoPromocion } from "@/components/asistente-promociones/tipo-promocion"
import { FormularioObjetivoPromocion } from "@/components/asistente-promociones/objetivo-promocion"
import { FormularioValorPromocion } from "@/components/asistente-promociones/valor-promocion"
import { FormularioCondicionesPromocion } from "@/components/asistente-promociones/condiciones-promocion"
import { FormularioProgramacionPromocion } from "@/components/asistente-promociones/programacion-promocion"
import { FormularioCodigoPromocion } from "@/components/asistente-promociones/codigo-promocion"
import { FormularioResumenPromocion } from "@/components/asistente-promociones/resumen-promocion"
import { crearPromocion } from "@/lib/api/promociones"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import type { TipoPromocion } from "@/types/promociones"

export default function AsistentePromocionesPage() {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Estado para almacenar los datos de la promoción
  const [datosPromocion, setDatosPromocion] = useState({
    titulo: "Nueva promoción",
    tipo: "PORCENTAJE_DESCUENTO" as TipoPromocion,
    objetivo: "TODOS_LOS_PRODUCTOS",
    valor: "10", // Valor por defecto
    condiciones: {
      cantidadMinima: "0",
      gastosEnvio: false,
      clientesEspecificos: false,
      clientesSeleccionados: [],
    },
    programacion: {
      fechaInicio: new Date().toISOString(),
      fechaFin: null as string | null,
      horaInicio: "00:00",
      horaFin: "23:59",
      limitarUsos: false,
      limiteUsos: "100",
    },
    codigo: {
      usarCodigo: true,
      codigo: `PROMO${Math.floor(Math.random() * 10000)}`,
      generarAutomaticamente: true,
    },
  })

  // Función para actualizar los datos de la promoción
  const actualizarDatosPromocion = (seccion, datos) => {
    setDatosPromocion((prevDatos) => ({
      ...prevDatos,
      [seccion]: datos,
    }))
  }

  // Función para avanzar al siguiente paso
  const siguientePaso = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1)
      window.scrollTo(0, 0)
    }
  }

  // Función para retroceder al paso anterior
  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1)
      window.scrollTo(0, 0)
    }
  }

  // Función para crear la promoción
  const handleCrearPromocion = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validar que el valor sea un número positivo
      const valor = Number.parseFloat(datosPromocion.valor)
      if (isNaN(valor) || valor <= 0) {
        setError("El valor de la promoción debe ser un número mayor que cero")
        setIsLoading(false)
        return
      }

      // Preparar los datos para la API
      const promocionData = {
        titulo: datosPromocion.titulo,
        tipo: datosPromocion.tipo,
        valor: datosPromocion.valor,
        fechaInicio: datosPromocion.programacion.fechaInicio,
        fechaFin: datosPromocion.programacion.fechaFin,
        codigo: datosPromocion.codigo.usarCodigo ? datosPromocion.codigo.codigo : null,
      }

      console.log("Datos de promoción a enviar:", promocionData)

      // Llamar a la API para crear la promoción
      const resultado = await crearPromocion(promocionData)

      console.log("Promoción creada:", resultado)

      // Redirigir a la página de promociones
      router.push("/dashboard/promociones")
    } catch (err) {
      console.error("Error al crear promoción:", err)
      setError(`Error al crear promoción: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Definir los pasos del asistente
  const pasos = [
    {
      titulo: "Tipo de promoción",
      descripcion: "Selecciona el tipo de promoción que quieres crear",
      contenido: (
        <FormularioTipoPromocion
          tipo={datosPromocion.tipo}
          onChange={(tipo) => actualizarDatosPromocion("tipo", tipo)}
        />
      ),
    },
    {
      titulo: "Objetivo",
      descripcion: "Define a qué productos se aplicará la promoción",
      contenido: (
        <FormularioObjetivoPromocion
          objetivo={datosPromocion.objetivo}
          onChange={(objetivo) => actualizarDatosPromocion("objetivo", objetivo)}
        />
      ),
    },
    {
      titulo: "Valor",
      descripcion: "Establece el valor del descuento",
      contenido: (
        <FormularioValorPromocion
          tipo={datosPromocion.tipo}
          valor={datosPromocion.valor}
          onChange={(valor) => actualizarDatosPromocion("valor", valor)}
        />
      ),
    },
    {
      titulo: "Condiciones",
      descripcion: "Define las condiciones para aplicar la promoción",
      contenido: (
        <FormularioCondicionesPromocion
          condiciones={datosPromocion.condiciones}
          onChange={(condiciones) => actualizarDatosPromocion("condiciones", condiciones)}
        />
      ),
    },
    {
      titulo: "Programación",
      descripcion: "Establece cuándo estará activa la promoción",
      contenido: (
        <FormularioProgramacionPromocion
          programacion={datosPromocion.programacion}
          onChange={(programacion) => actualizarDatosPromocion("programacion", programacion)}
        />
      ),
    },
    {
      titulo: "Código promocional",
      descripcion: "Configura el código de descuento",
      contenido: (
        <FormularioCodigoPromocion
          codigo={datosPromocion.codigo}
          onChange={(codigo) => actualizarDatosPromocion("codigo", codigo)}
        />
      ),
    },
    {
      titulo: "Resumen",
      descripcion: "Revisa y confirma los detalles de la promoción",
      contenido: (
        <FormularioResumenPromocion
          datosPromocion={datosPromocion}
          onTituloChange={(titulo) => setDatosPromocion({ ...datosPromocion, titulo })}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/promociones")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Asistente de promociones</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <Pasos pasoActual={pasoActual} className="mb-8">
            {pasos.map((paso, index) => (
              <Paso key={index} titulo={paso.titulo} descripcion={paso.descripcion} />
            ))}
          </Pasos>

          <div className="mb-8">{pasos[pasoActual].contenido}</div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={pasoAnterior} disabled={pasoActual === 0 || isLoading}>
              Anterior
            </Button>
            {pasoActual < pasos.length - 1 ? (
              <Button onClick={siguientePaso} disabled={isLoading}>
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleCrearPromocion}
                className="bg-granito hover:bg-granito/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear promoción"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
