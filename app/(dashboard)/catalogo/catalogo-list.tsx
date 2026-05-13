'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Pencil, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface KitItem {
  id: string
  quantidade: number
  componente: string
}

interface CatalogoItem {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  foto_url: string | null
  kit: KitItem[]
}

export function CatalogoList({ initialItens }: { initialItens: CatalogoItem[] }) {
  const [itens, setItens] = useState(initialItens)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  const filtrados = itens.filter(item =>
    item.nome.toLowerCase().includes(search.toLowerCase()) ||
    (item.categoria?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const { error } = await supabase.from('catalogo').delete().eq('id', deleteId)

    if (error) {
      toast.error('Erro ao excluir item')
    } else {
      toast.success('Item excluído')
      setItens(itens.filter(i => i.id !== deleteId))
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum item no catálogo</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Foto */}
              <div className="relative h-48 bg-muted">
                {item.foto_url ? (
                  <Image
                    src={item.foto_url}
                    alt={item.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{item.nome}</h3>
                    {item.categoria && (
                      <Badge variant="outline" className="mt-1 text-xs">{item.categoria}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/catalogo/${item.id}/editar`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {item.descricao && (
                  <p className="text-sm text-muted-foreground">{item.descricao}</p>
                )}

                {/* Kit */}
                {item.kit.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      {expandedId === item.id ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      Kit — {item.kit.length} componente{item.kit.length > 1 ? 's' : ''}
                    </button>

                    {expandedId === item.id && (
                      <div className="mt-2 rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Qtd</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Componente</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.kit.map((k) => (
                              <tr key={k.id} className="border-t border-border">
                                <td className="px-3 py-2 font-medium text-center w-12">{k.quantidade}</td>
                                <td className="px-3 py-2">{k.componente}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {item.kit.length === 0 && (
                  <p className="text-xs text-muted-foreground">Kit: N/A</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O item e todos os componentes do kit serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}