'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Colaborador } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Search, MoreHorizontal, Pencil, Trash2, Eye, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ColaboradoresListProps {
  initialColaboradores: Colaborador[]
}

export function ColaboradoresList({ initialColaboradores }: ColaboradoresListProps) {
  const [colaboradores, setColaboradores] = useState(initialColaboradores)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredColaboradores = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) ||
    c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.setor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', deleteId)

    if (error) {
      toast.error('Erro ao excluir colaborador')
      console.error(error)
    } else {
      toast.success('Colaborador excluído com sucesso')
      setColaboradores(colaboradores.filter((c) => c.id !== deleteId))
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from('colaboradores')
      .update({ ativo: !ativo })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar status')
      console.error(error)
    } else {
      toast.success(`Colaborador ${ativo ? 'desativado' : 'ativado'} com sucesso`)
      setColaboradores(colaboradores.map((c) =>
        c.id === id ? { ...c, ativo: !ativo } : c
      ))
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF, cargo ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredColaboradores.length} colaborador(es)
            </div>
          </div>

          {filteredColaboradores.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nenhum colaborador encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Comece adicionando seu primeiro colaborador'}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/colaboradores/novo">Adicionar Colaborador</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((colaborador) => (
                    <TableRow key={colaborador.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {colaborador.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{colaborador.nome}</p>
                            {colaborador.email && (
                              <p className="text-xs text-muted-foreground">{colaborador.email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatCPF(colaborador.cpf)}
                      </TableCell>
                      <TableCell>{colaborador.cargo}</TableCell>
                      <TableCell>{colaborador.setor}</TableCell>
                      <TableCell>
                        <Badge variant={colaborador.ativo ? 'default' : 'secondary'}>
                          {colaborador.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/colaboradores/${colaborador.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/colaboradores/${colaborador.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleAtivo(colaborador.id, colaborador.ativo)}
                            >
                              {colaborador.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(colaborador.id)}
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
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
