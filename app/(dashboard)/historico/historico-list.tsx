'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Search, Filter, ArrowUpFromLine, ArrowDownToLine, History } from 'lucide-react'

interface Movimentacao {
  id: string
  tipo: 'retirada' | 'devolucao'
  quantidade: number
  data_movimentacao: string
  data_prevista_devolucao: string | null
  data_devolucao_efetiva: string | null
  status: string
  motivo: string | null
  local_uso: string | null
  observacoes: string | null
  ferramenta: {
    id: string
    codigo: string
    nome: string
  } | null
  colaborador: {
    id: string
    nome: string
    cpf: string
    cargo: string
    setor: string
  } | null
}

interface HistoricoListProps {
  movimentacoes: Movimentacao[]
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', variant: 'secondary' },
  concluido: { label: 'Concluído', variant: 'default' },
  atrasado: { label: 'Atrasado', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
}

export function HistoricoList({ movimentacoes }: HistoricoListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredMovimentacoes = movimentacoes.filter((m) => {
    const matchesSearch =
      m.ferramenta?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ferramenta?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.colaborador?.nome.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = tipoFilter === 'all' || m.tipo === tipoFilter
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter

    return matchesSearch && matchesTipo && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ferramenta ou colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="retirada">Retiradas</SelectItem>
              <SelectItem value="devolucao">Devoluções</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {filteredMovimentacoes.length} registro(s)
          </div>
        </div>

        {filteredMovimentacoes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhum registro encontrado</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || tipoFilter !== 'all' || statusFilter !== 'all'
                ? 'Tente ajustar seus filtros'
                : 'O histórico de movimentações aparecerá aqui'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mov.tipo === 'retirada' ? (
                          <div className="p-1.5 rounded bg-primary/10">
                            <ArrowUpFromLine className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded bg-accent/20">
                            <ArrowDownToLine className="h-4 w-4 text-accent" />
                          </div>
                        )}
                        <span className="capitalize">{mov.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{mov.ferramenta?.nome}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {mov.ferramenta?.codigo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{mov.colaborador?.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {mov.colaborador?.cargo} - {mov.colaborador?.setor}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(mov.data_movimentacao)}</p>
                        {mov.tipo === 'retirada' && mov.data_prevista_devolucao && (
                          <p className="text-xs text-muted-foreground">
                            Prev: {new Date(mov.data_prevista_devolucao).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[mov.status]?.variant || 'outline'}>
                        {statusLabels[mov.status]?.label || mov.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
