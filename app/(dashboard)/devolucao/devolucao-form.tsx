'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { PhotoUpload } from '@/components/photo-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Calendar, User, Wrench, MapPin, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MovimentacaoPendente {
  id: string
  quantidade: number
  data_movimentacao: string
  data_prevista_devolucao: string | null
  motivo: string | null
  local_uso: string | null
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
  } | null
}

interface DevolucaoFormProps {
  movimentacoesPendentes: MovimentacaoPendente[]
}

export function DevolucaoForm({ movimentacoesPendentes }: DevolucaoFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedMovimentacao = movimentacoesPendentes.find(m => m.id === selectedId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const isAtrasado = (dataPrevista: string | null) => {
    if (!dataPrevista) return false
    return new Date(dataPrevista) < new Date()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedId || !selectedMovimentacao) {
      toast.error('Selecione uma retirada para devolver')
      return
    }

    setIsLoading(true)

    try {
      // Update movimentação to concluido
      const { error: movError } = await supabase
        .from('movimentacoes')
        .update({
          status: 'concluido',
          data_devolucao_efetiva: new Date().toISOString(),
          observacoes: observacoes || null,
          foto_devolucao_url: fotoUrl,
        })
        .eq('id', selectedId)

      if (movError) throw movError

      // Create devolução record
      const { error: devError } = await supabase
        .from('movimentacoes')
        .insert({
          tipo: 'devolucao',
          ferramenta_id: selectedMovimentacao.ferramenta!.id,
          colaborador_id: selectedMovimentacao.colaborador!.id,
          quantidade: selectedMovimentacao.quantidade,
          observacoes: observacoes || null,
          foto_devolucao_url: fotoUrl,
          status: 'concluido',
          movimentacao_origem_id: selectedId,
        })

      if (devError) throw devError

      // Update ferramenta stock
      const { data: ferramenta } = await supabase
        .from('ferramentas')
        .select('quantidade_disponivel')
        .eq('id', selectedMovimentacao.ferramenta!.id)
        .single()

      if (ferramenta) {
        const { error: stockError } = await supabase
          .from('ferramentas')
          .update({
            quantidade_disponivel: ferramenta.quantidade_disponivel + selectedMovimentacao.quantidade,
          })
          .eq('id', selectedMovimentacao.ferramenta!.id)

        if (stockError) throw stockError
      }

      toast.success('Devolução registrada com sucesso')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao registrar devolução')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista de Retiradas Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle>Retiradas Pendentes</CardTitle>
            <CardDescription>
              Selecione a retirada que será devolvida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {movimentacoesPendentes.map((mov) => (
              <button
                key={mov.id}
                type="button"
                onClick={() => setSelectedId(mov.id)}
                disabled={isLoading}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-colors',
                  selectedId === mov.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50',
                  isAtrasado(mov.data_prevista_devolucao) && 'border-destructive/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {mov.ferramenta?.codigo} - {mov.ferramenta?.nome}
                    </span>
                  </div>
                  <Badge variant="outline">Qtd: {mov.quantidade}</Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{mov.colaborador?.nome}</span>
                    <span className="text-xs">({mov.colaborador?.cargo})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Retirado em: {formatDate(mov.data_movimentacao)}</span>
                  </div>

                  {mov.data_prevista_devolucao && (
                    <div className={cn(
                      'flex items-center gap-2',
                      isAtrasado(mov.data_prevista_devolucao) && 'text-destructive'
                    )}>
                      {isAtrasado(mov.data_prevista_devolucao) && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      <span>
                        Previsto: {formatDate(mov.data_prevista_devolucao)}
                        {isAtrasado(mov.data_prevista_devolucao) && ' (Atrasado)'}
                      </span>
                    </div>
                  )}

                  {mov.local_uso && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{mov.local_uso}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Dados da Devolução */}
        <div className="space-y-6">
          {selectedMovimentacao && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Devolução</CardTitle>
                <CardDescription>
                  {selectedMovimentacao.ferramenta?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Colaborador:</span>
                    <span className="text-sm font-medium">{selectedMovimentacao.colaborador?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CPF:</span>
                    <span className="text-sm font-mono">{formatCPF(selectedMovimentacao.colaborador?.cpf || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade:</span>
                    <span className="text-sm font-medium">{selectedMovimentacao.quantidade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data Retirada:</span>
                    <span className="text-sm">{formatDate(selectedMovimentacao.data_movimentacao)}</span>
                  </div>
                  {selectedMovimentacao.motivo && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Motivo:</span>
                      <span className="text-sm">{selectedMovimentacao.motivo}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações da Devolução</Label>
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Estado da ferramenta, problemas encontrados..."
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedMovimentacao && (
            <Card>
              <CardHeader>
                <CardTitle>Registro Fotográfico</CardTitle>
                <CardDescription>
                  Tire uma foto da ferramenta no momento da devolução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  value={fotoUrl}
                  onChange={setFotoUrl}
                  folder="devolucoes"
                  label="Foto da Ferramenta"
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <Button type="button" variant="outline" asChild disabled={isLoading}>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading || !selectedId}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Registrar Devolução
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
