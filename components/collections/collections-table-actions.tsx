"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreHorizontal, Pencil, Copy, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { deleteCollection } from "@/lib/actions"

interface CollectionsTableActionsProps {
  collection: {
    id: string
    title: string
    handle: string
  }
}

export function CollectionsTableActions({ collection }: CollectionsTableActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteCollection(collection.id)

      toast({
        title: "Colección eliminada",
        description: `La colección "${collection.title}" ha sido eliminada correctamente.`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la colección. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/colecciones/${collection.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/collections/${collection.handle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver en tienda
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(collection.id)
              toast({
                title: "ID copiado",
                description: "ID de la colección copiado al portapapeles",
              })
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la colección "{collection.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
