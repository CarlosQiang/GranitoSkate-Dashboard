"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, Percent, Tag, ShoppingBag, Calendar, Target, Code } from "lucide-react"
import { Pasos, Paso } from "@/components/ui/pasos"
import { SelectorTipoPromocion } from "@/components/asistente-promociones/tipo-promocion"
import { SelectorObjetivoPromocion } from "@/components/asistente-promociones/objetivo-promocion"
import { FormularioValorPromocion } from "@/components/asistente-promociones/valor-promocion"
import { FormularioCondicionesPromocion } from "@/components/asistente-promociones/condiciones-promocion"
import { FormularioProgramacionPromocion } from "@/components/asistente-promociones/programacion-promocion"
import { FormularioCodigoPromocion } from "@/components/asistente-promociones/codigo-promocion"
import { ResumenPromocion } from "@/components/asistente-promociones/resumen-promocion"
import { useToast } from "@/components/ui/use-toast"
import { crearPromocion } from "@/lib/api/promociones"
import type { DatosAsistentePromocion } from "@/types/promociones"

/**
 * Página del asistente de promociones
 *
 * Este asistente guía al usuario a través del proceso de creación de una promoción
 * paso a paso, facilitando la configuración de todos los parámetros necesarios.
 *
 * @author María García
 * @version 1.2.0
 */
export default function PaginaAsistentePromociones() {
  // Hooks y estado
  const router = useRouter()
  const { toast } = useToast()
  const [pasoActual, setPasoActual] = useState(0)
  const [enviando, setEnviando] = useState(false)

  // Estado principal del formulario
  // Inicializamos con valores por defecto
  const [datosPromo, setDatosPromo] = useState<DatosAsistentePromocion>({
    titulo: "",
    descripcion: "",
    tipo: "PORCENTAJE_DESCUENTO", // El más común
    objetivo: "CARRITO", // Por defecto a toda la tienda
    objetivoId: "",
    valor: "",
    compraMinima: "",
    requiereCodigo: false,
    codigo: "",
    tieneFechaFin: false,
    fechaInicio: new Date(), // Hoy
    fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Un mes después
    limitarUsos: false,
    limiteUsos: "",
  })

  // Función para actualizar el estado del formulario
  const actualizarDatos = (datos: Partial<DatosAsistentePromocion>) => {
    setDatosPromo((prevDatos) => ({ ...prevDatos, ...datos }))
  }

  // Definición de los pasos del asistente
  const pasos = [
    {
      id: "tipo",
      nombre: "Tipo de descuento",
      descripcion: "Elige el tipo de descuento que quieres crear",
      icono: Percent,
      componente: <SelectorTipoPromocion valor={datosPromo.tipo} onChange={(tipo) => actualizarDatos({ tipo })} />,
    },
    {
      id: "objetivo",
      nombre: "Aplicación",
      descripcion: "Decide dónde aplicar el descuento",
      icono: Target,
      componente: (
        <SelectorObjetivoPromocion
          valor={datosPromo.objetivo}
          objetivoId={datosPromo.objetivoId}
          onChange={(objetivo, objetivoId) => actualizarDatos({ objetivo, objetivoId })}
        />
      ),
    },
    {
      id: "valor",
      nombre: "Valor",
      descripcion: "Define el valor del descuento",
      icono: Tag,
      componente: (
        <FormularioValorPromocion
          tipo={datosPromo.tipo}
          valor={datosPromo.valor}
          onChange={(valor) => actualizarDatos({ valor })}
        />
      ),
    },
    {
      id: "condiciones",
      nombre: "Condiciones",
      descripcion: "Establece condiciones adicionales",
      icono: ShoppingBag,
      componente: (
        <FormularioCondicionesPromocion
          compraMinima={datosPromo.compraMinima}
          onChange={(datos) => actualizarDatos(datos)}
        />
      ),
    },
    {
      id: "programacion",
      nombre: "Programación",
      descripcion: "Define cuándo estará activo",
      icono: Calendar,
      componente: (
        <FormularioProgramacionPromocion
          tieneFechaFin={datosPromo.tieneFechaFin}
          fechaInicio={datosPromo.fechaInicio}
          fechaFin={datosPromo.fechaFin}
          limitarUsos={datosPromo.limitarUsos}
          limiteUsos={datosPromo.limiteUsos}
          onChange={(datos) => actualizarDatos(datos)}
        />
      ),
    },
    {
      id: "codigo",
      nombre: "Código",
      descripcion: "Opcional: añade un código promocional",
      icono: Code,
      componente: (
        <FormularioCodigoPromocion
          requiereCodigo={datosPromo.requiereCodigo}
          codigo={datosPromo.codigo}
          onChange={(datos) => actualizarDatos(datos)}
        />
      ),
    },
    {
      id: "resumen",
      nombre: "Resumen",
      descripcion: "Revisa y confirma tu promoción",
      icono: Check,
      componente: <ResumenPromocion datos={datosPromo} onChange={(datos) => actualizarDatos(datos)} />,
    },
  ]

  // Navegación entre pasos
  const handleSiguiente = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1)
      window.scrollTo(0, 0) // Scroll al inicio para mejor UX
    }
  }

  const handleAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1)
      window.scrollTo(0, 0)
    }
  }

  // Envío del formulario
  const handleEnviar = async () => {
    try {
      setEnviando(true)

      // Validaciones básicas
      if (!datosPromo.titulo) {
        datosPromo.titulo = generarTituloPredeterminado(datosPromo)
      }

      if (!datosPromo.valor || isNaN(Number(datosPromo.valor)) || Number(datosPromo.valor) <= 0) {
        throw new Error("El valor de la promoción debe ser un número mayor que cero")
      }

      if (datosPromo.requiereCodigo && !datosPromo.codigo) {
        throw new Error("El código de la promoción es obligatorio si requiere código")
      }

      // Preparar datos para la API
      const datosAPI = {
        titulo: datosPromo.titulo,
        descripcion: datosPromo.descripcion,
        tipo: datosPromo.tipo,
        objetivo: datosPromo.objetivo,
        objetivoId: datosPromo.objetivoId || undefined,
        valor: Number(datosPromo.valor),
        condiciones: [],
        activa: true,
        fechaInicio: datosPromo.fechaInicio.toISOString(),
        fechaFin: datosPromo.tieneFechaFin ? datosPromo.fechaFin.toISOString() : undefined,
        codigo: datosPromo.requiereCodigo ? datosPromo.codigo : undefined,
        limiteUsos: datosPromo.limitarUsos ? Number(datosPromo.limiteUsos) : undefined,
        contadorUsos: 0,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      }

      // Añadir condición de compra mínima si se especifica
      if (datosPromo.compraMinima && !isNaN(Number(datosPromo.compraMinima)) && Number(datosPromo.compraMinima) > 0) {
        datosAPI.condiciones.push({
          tipo: "CANTIDAD_MINIMA",
          valor: Number(datosPromo.compraMinima),
        })
      }

      // Llamada a la API
      await crearPromocion(datosAPI)

      // Notificar éxito
      toast({
        title: "¡Promoción creada!",
        description: "La promoción se ha creado correctamente",
      })

      // Redireccionar a la lista de promociones
      router.push("/dashboard/promociones")
    } catch (error) {
      console.error("Error al crear promoción:", error)
      toast({
        title: "Error",
        description: `No se pudo crear la promoción: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  // Genera un título predeterminado basado en los datos de la promoción
  const generarTituloPredeterminado = (datos: DatosAsistentePromocion) => {
    let textoTipo = ""

    // Texto según el tipo de promoción
    switch (datos.tipo) {
      case "PORCENTAJE_DESCUENTO":
        textoTipo = `${datos.valor}% de descuento`
        break
      case "CANTIDAD_FIJA":
        textoTipo = `${datos.valor}€ de descuento`
        break
      case "COMPRA_X_LLEVA_Y":
        textoTipo = `Compra y lleva ${datos.valor} gratis`
        break
      case "ENVIO_GRATIS":
        textoTipo = `Envío gratis`
        break
    }

    // Texto según el objetivo
    let textoObjetivo = ""
    switch (datos.objetivo) {
      case "CARRITO":
        textoObjetivo = "en toda la tienda"
        break
      case "COLECCION":
        textoObjetivo = "en colección"
        break
      case "PRODUCTO":
        textoObjetivo = "en producto"
        break
    }

    return `${textoTipo} ${textoObjetivo}`
  }

  return (
    <div className="space-y-6">
      {/* Cabecera con botón de volver */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/promociones")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Asistente de promociones</h1>
        </div>
      </div>

      {/* Tarjeta principal */}
      <Card>
        <CardHeader>
          <CardTitle>Crea una promoción en simples pasos</CardTitle>
          <CardDescription>
            Este asistente te guiará en la creación de una promoción personalizada para tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Indicador de pasos */}
          <div className="mb-8">
            <Pasos pasoActual={pasoActual}>
              {pasos.map((paso, index) => (
                <Paso
                  key={paso.id}
                  titulo={paso.nombre}
                  descripcion={paso.descripcion}
                  icono={paso.icono}
                  esActivo={pasoActual === index}
                  esCompletado={pasoActual > index}
                />
              ))}
            </Pasos>
          </div>

          {/* Contenido del paso actual */}
          <div className="py-4">{pasos[pasoActual].componente}</div>

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleAnterior} disabled={pasoActual === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {pasoActual < pasos.length - 1 ? (
              <Button onClick={handleSiguiente} className="bg-granito hover:bg-granito-dark">
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleEnviar} disabled={enviando} className="bg-granito hover:bg-granito-dark">
                {enviando ? "Creando..." : "Crear promoción"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
