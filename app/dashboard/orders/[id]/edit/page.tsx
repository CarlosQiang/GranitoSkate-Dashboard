"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Plus, X, Save } from "lucide-react"
import { fetchOrderById, updateOrder, fetchOrderTags } from "@/lib/api/orders"
import { useToast } from "@/components/ui/use-toast"

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [note, setNote] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [customAttributes, setCustomAttributes] = useState<{ key: string; value: string }[]>([])
  const [newAttributeKey, setNewAttributeKey] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")

  useEffect(() => {
    const getOrder = async () => {
      try {
        setIsLoading(true)
        const data = await fetchOrderById(params.id)
        setOrder(data)
        setNote(data.note || "")
        setTags(data.tags || [])
        setCustomAttributes(data.customAttributes || [])

        // Cargar etiquetas sugeridas
        const tagsList = await fetchOrderTags()
        setSuggestedTags(tagsList)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el pedido",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getOrder()
  }, [params.id, toast])

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddAttribute = () => {
    if (newAttributeKey && newAttributeValue) {
      setCustomAttributes([...customAttributes, { key: newAttributeKey, value: newAttributeValue }])
      setNewAttributeKey("")
      setNewAttributeValue("")
    }
  }

  const handleRemoveAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateOrder(params.id, {
        note,
        tags,
        customAttributes,
      })

      toast({
        title: "Pedido actualizado",
        description: "Los cambios se han guardado correctamente",
      })

      router.push(`/dashboard/orders/${params.id}`)
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isLoading ? <Skeleton className="h-9 w-32" /> : `Editar pedido ${order?.name}`}
            </h1>
            <p className="text-muted-foreground">Editar etiquetas, notas y atributos personalizados</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Añade notas sobre este pedido..."
                className="min-h-32"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Añadir etiqueta..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Eliminar</span>
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && <p className="text-sm text-muted-foreground">No hay etiquetas</p>}
                </div>

                {suggestedTags.length > 0 && (
                  <div>
                    <Label className="text-sm">Etiquetas sugeridas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedTags.slice(0, 10).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            if (!tags.includes(tag)) {
                              setTags([...tags, tag])
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atributos personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attribute-key">Clave</Label>
                    <Input
                      id="attribute-key"
                      placeholder="Nombre del atributo"
                      value={newAttributeKey}
                      onChange={(e) => setNewAttributeKey(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="attribute-value">Valor</Label>
                    <Input
                      id="attribute-value"
                      placeholder="Valor del atributo"
                      value={newAttributeValue}
                      onChange={(e) => setNewAttributeValue(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleAddAttribute}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir atributo
                </Button>

                {customAttributes.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Clave</th>
                          <th className="text-left p-2">Valor</th>
                          <th className="p-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {customAttributes.map((attr, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="p-2">{attr.key}</td>
                            <td className="p-2">{attr.value}</td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAttribute(index)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay atributos personalizados</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
