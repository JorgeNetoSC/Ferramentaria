'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Ferramenta, Categoria } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Wrench,
  Filter,
  PackageX,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FerramentasListProps {
  initialFerramentas: (Ferramenta & { categoria?: Categoria | null })[]
  categorias: Categoria[]
}

const estadoLabels: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  novo: { label: 'Novo', variant: 'default' },
  bom: { label: 'Bom', variant: 'secondary' },
  regular: { label: 'Regular', variant: 'outline' },
  ruim: { label: 'Ruim', variant: 'destructive' },
  em_manutencao: { label: 'Em Manutenção', variant: 'destructive' },
  descarte: { label: 'Descarte', variant: 'destructive' },
}

export function FerramentasList({
  initialFerramentas,
  categorias,
}: FerramentasListProps) {
  const [ferramentas, setFerramentas] = useState(initialFerramentas)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [descarteId, setDescarteId] = useState<string | null>(null)
  const [isDescartando, setIsDescartando] = useState(false)

  const supabase = createClient()

  // 🔧 ENVIAR PARA MANUTENÇÃO
  async function handleManutencao(ferramenta: Ferramenta) {
    if (ferramenta.quantidade_disponivel === 0) {
      toast.error('Ferramenta indisponível — aguarde a devolução antes de enviar para manutenção')
      return
    }

    try {
      const { error } = await supabase
        .from('ferramentas')
        .update({
          estado_conservacao: 'em_manutencao',
          quantidade_disponivel: Math.max(0, ferramenta.quantidade_disponivel - 1),
        })
        .eq('id', ferramenta.id)

      if (error) throw error

      toast.success('Ferramenta enviada para manutenção')

      setFerramentas((prev) =>
        prev.map((f) =>
          f.id === ferramenta.id
            ? {
                ...f,
                estado_conservacao: 'em_manutencao',
                quantidade_disponivel: Math.max(0, f.quantidade_disponivel - 1),
              }
            : f
        )
      )
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar para manutenção')
    }
  }

  // ✅ FINALIZAR MANUTENÇÃO
  const handleFinalizarManutencao = async (ferramenta: Ferramenta) => {
    const { error } = await supabase
      .from('ferramentas')
      .update({
        estado_conservacao: 'bom',
        quantidade_disponivel: ferramenta.quantidade_disponivel + 1,
      })
      .eq('id', ferramenta.id)

    if (error) {
      toast.error('Erro ao finalizar manutenção')
      console.error(error)
    } else {
      toast.success('Manutenção finalizada')
      setFerramentas((prev) =>
        prev.map((f) =>
          f.id === ferramenta.id
            ? { ...f, estado_conservacao: 'bom', quantidade_disponivel: f.quantidade_disponivel + 1 }
            : f
        )
      )
    }
  }

  // 🗑️ DESCARTE
  const handleDescarte = async () => {
    if (!descarteId) return
    setIsDescartando(true)

    const { error } = await supabase
  .from('ferramentas')
  .update({
    estado_conservacao: 'descarte',
    quantidade_disponivel: 0,
    ativo: false,
  })
  .eq('id', descarteId)

    if (error) {
      toast.error('Erro ao enviar para descarte')
      console.error(error)
    } else {
      toast.success('Ferramenta enviada para descarte')
      setFerramentas(ferramentas.filter((f) => f.id !== descarteId))
    }

    setIsDescartando(false)
    setDescarteId(null)
  }

  // ❌ EXCLUIR
  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    const { error } = await supabase
      .from('ferramentas')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast.error('Erro ao excluir ferramenta')
      console.error(error)
    } else {
      toast.success('Ferramenta excluída com sucesso')
      setFerramentas(ferramentas.filter((f) => f.id !== deleteId))
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  // 🔎 FILTRO
  const filteredFerramentas = ferramentas.filter((f) => {
    const matchesSearch =
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategoria =
      categoriaFilter === 'all' || f.categoria_id === categoriaFilter

    return matchesSearch && matchesCategoria
  })

  // 📦 BADGE DISPONIBILIDADE
  const getDisponibilidadeBadge = (ferramenta: Ferramenta) => {
    if (ferramenta.estado_conservacao === 'em_manutencao') {
      return <Badge variant="destructive">Manutenção</Badge>
    }
    if (ferramenta.quantidade_disponivel === 0) {
      return <Badge variant="outline">Indisponível</Badge>
    }
    if (ferramenta.quantidade_disponivel < ferramenta.quantidade_total) {
      return (
        <Badge variant="secondary">
          {ferramenta.quantidade_disponivel}/{ferramenta.quantidade_total}
        </Badge>
      )
    }
    return <Badge variant="default">Disponível</Badge>
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* FILTROS */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TABELA */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFerramentas.map((ferramenta) => (
                  <TableRow key={ferramenta.id}>
                    <TableCell>{ferramenta.codigo}</TableCell>
                    <TableCell>{ferramenta.nome}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          estadoLabels[ferramenta.estado_conservacao ?? 'novo']?.variant || 'outline'
                        }
                      >
                        {estadoLabels[ferramenta.estado_conservacao ?? 'novo']?.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {getDisponibilidadeBadge(ferramenta)}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/ferramentas/${ferramenta.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`/ferramentas/${ferramenta.id}/editar`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* 🔧 ENVIAR PARA MANUTENÇÃO */}
                          {ferramenta.estado_conservacao !== 'em_manutencao' && (
                            <DropdownMenuItem
                              onClick={() => handleManutencao(ferramenta)}
                              disabled={ferramenta.quantidade_disponivel === 0}
                              className={ferramenta.quantidade_disponivel === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              <Wrench className="mr-2 h-4 w-4" />
                              Enviar para manutenção
                            </DropdownMenuItem>
                          )}

                          {/* ✅ FINALIZAR MANUTENÇÃO */}
                          {ferramenta.estado_conservacao === 'em_manutencao' && (
                            <DropdownMenuItem onClick={() => handleFinalizarManutencao(ferramenta)}>
                              <Wrench className="mr-2 h-4 w-4" />
                              Finalizar manutenção
                            </DropdownMenuItem>
                          )}

                          {/* 📦 DESCARTE */}
                          {ferramenta.quantidade_disponivel === 0 ? null : (
                            <DropdownMenuItem
                              className="text-orange-500 focus:text-orange-500"
                              onClick={() => setDescarteId(ferramenta.id)}
                            >
                              <PackageX className="mr-2 h-4 w-4" />
                              Enviar para descarte
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          {/* ❌ EXCLUIR */}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(ferramenta.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DESCARTE */}
      <AlertDialog open={!!descarteId} onOpenChange={() => setDescarteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar descarte</AlertDialogTitle>
            <AlertDialogDescription>
              A ferramenta será marcada como inativa e removida do estoque disponível. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDescartando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDescarte}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isDescartando ? 'Descartando...' : 'Confirmar Descarte'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL DELETE */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
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