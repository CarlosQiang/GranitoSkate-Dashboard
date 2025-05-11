"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, FolderOpen, Package, Loader2, Search } from "lucide-react"
import { obtenerColecciones } from "@/lib/api/colecciones"
import { obtenerProductos } from "@/lib/api/productos"
import type { ObjetivoPromocion } from "@/types/promociones"

interface SelectorObjetivoPromocionProps {
  valor: ObjetivoPromocion
  objetivoId: string
  onChange: (objetivo: ObjetivoPromocion, objetivoId?: string) => void
}

export function SelectorObjetivoPromocion({ valor, objetivoId, onChange }: SelectorObjetivoPromocionProps) {
  const [colecciones, setColecciones] = useState<Array<{ id: string; titulo: string }>>([])
  const [productos, setProductos] = useState<Array<{ id: string; titulo: string }>>([])
  const [cargandoColecciones, setCargandoColecciones] = useState(false)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [resultadosBusqueda, setResultadosBusqueda] = useState<
    Array<{ id: string; titulo: string; tipo: "producto" | "coleccion" }>
  >([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (valor === "COLECCION" && colecciones.length === 0) {
      cargarColecciones()
    } else if (valor === "PRODUCTO" && productos.length === 0) {
      cargarProductos()
    }
  }, [valor])

  const cargarColecciones = async () => {
    try {
      setCargandoColecciones(true)
      const datos = await obtenerColecciones()
      setColecciones(datos.map((c) => ({ id: c.id, titulo: c.titulo })))
    } catch (error) {
      console.error("Error al cargar colecciones:", error)
    } finally {
      setCargandoColecciones(false)
    }
  }

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true)
      const datos = await obtenerProductos()
      setProductos(datos.map((p) => ({ id: p.id, titulo: p.titulo })))
    } catch (error) {
      console.error("Error al cargar productos:", error)
    } finally {
      setCargandoProductos(false)
    }
  }

  const handleBuscar = async () => {
    if (!terminoBusqueda.trim()) return

    setBuscando(true)
    try {
      const resultadosProductos = await obtenerProductos({ consulta: terminoBusqueda })
      const resultadosColecciones = await obtenerColecciones({ consulta: terminoBusqueda })

      setResultadosBusqueda([
        ...resultadosProductos.map((p) => ({ id: p.id, titulo: p.titulo, tipo: "producto" as const })),
        ...resultadosColecciones.map((c) => ({ id: c.id, titulo: c.titulo, tipo: "coleccion" as const })),
      ])
    } catch (error) {
      console.error("Error al buscar:", error)
    } finally {
      setBuscando(false)
    }
  }

  const handleSeleccionarResultado = (item: { id: string; titulo: string; tipo: "producto" | "coleccion" }) => {
    onChange(item.tipo === "producto" ? "PRODUCTO" : "COLECCION", item.id)
    setTerminoBusqueda("")
    setResultadosBusqueda([])
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">¿Dónde quieres aplicar el descuento?</h2>
      <p className="text-muted-foreground">
        Decide si el descuento se aplicará a toda la tienda, a una colección específica o a un producto concreto
      </p>

      <RadioGroup
        value={valor}
        onValueChange={(valor) => onChange(valor as ObjetivoPromocion, "")}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
      >
        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
          <RadioGroupItem value="CARRITO" id="carrito" />
          <Label htmlFor="carrito" className="flex items-center cursor-pointer">
            <ShoppingCart className="h-5 w-5 mr-2 text-granito" />
            <div>
              <p className="font-medium">Toda la tienda</p>
              <p className="text-sm text-muted-foreground">Aplicar a todos los productos</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
          <RadioGroupItem value="COLECCION" id="coleccion" />
          <Label htmlFor="coleccion" className="flex items-center cursor-pointer">
            <FolderOpen className="h-5 w-5 mr-2 text-granito" />
            <div>
              <p className="font-medium">Una colección</p>
              <p className="text-sm text-muted-foreground">Aplicar a una colección específica</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
          <RadioGroupItem value="PRODUCTO" id="producto" />
          <Label htmlFor="producto" className="flex items-center cursor-pointer">
            <Package className="h-5 w-5 mr-2 text-granito" />
            <div>
              <p className="font-medium">Un producto</p>
              <p className="text-sm text-muted-foreground">Aplicar a un producto específico</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {valor !== "CARRITO" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="buscar">Buscar {valor === "COLECCION" ? "colecciones" : "productos"}</Label>
            <div className="flex gap-2">
              <Input
                id="buscar"
                placeholder={`Buscar ${valor === "COLECCION" ? "colecciones" : "productos"}...`}
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleBuscar}
                disabled={buscando}
                className="bg-granito hover:bg-granito-dark"
              >
                {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {resultadosBusqueda.length > 0 && (
            <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">Resultados de búsqueda:</p>
              <ul className="space-y-1">
                {resultadosBusqueda.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleSeleccionarResultado(item)}
                    >
                      {item.tipo === "producto" ? (
                        <Package className="h-4 w-4 mr-2 text-granito" />
                      ) : (
                        <FolderOpen className="h-4 w-4 mr-2 text-granito" />
                      )}
                      <span className="truncate">{item.titulo}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {valor === "COLECCION" ? (
            <div className="space-y-2">
              <Label htmlFor="coleccion-select">Selecciona una colección</Label>
              {cargandoColecciones ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando colecciones...</span>
                </div>
              ) : colecciones.length > 0 ? (
                <Select value={objetivoId} onValueChange={(valor) => onChange("COLECCION", valor)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una colección" />
                  </SelectTrigger>
                  <SelectContent>
                    {colecciones.map((coleccion) => (
                      <SelectItem key={coleccion.id} value={coleccion.id}>
                        {coleccion.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No se encontraron colecciones. Intenta buscar o crear una nueva colección.
                </div>
              )}
            </div>
          ) : valor === "PRODUCTO" ? (
            <div className="space-y-2">
              <Label htmlFor="producto-select">Selecciona un producto</Label>
              {cargandoProductos ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Cargando productos...</span>
                </div>
              ) : productos.length > 0 ? (
                <Select value={objetivoId} onValueChange={(valor) => onChange("PRODUCTO", valor)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No se encontraron productos. Intenta buscar o crear un nuevo producto.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-4 p-4 bg-granito-light/10 border border-granito-light/20 rounded-md">
        <h3 className="text-sm font-medium text-granito-dark">Consejo:</h3>
        <p className="text-sm text-granito-dark/80">
          Los descuentos en colecciones específicas son ideales para promocionar categorías de productos, mientras que
          los descuentos en productos individuales son perfectos para liquidar stock.
        </p>
      </div>
    </div>
  )
}
