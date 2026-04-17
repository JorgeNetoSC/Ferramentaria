import { createClient } from '@/lib/supabase/server'
import { DevolucaoForm } from './devolucao-form'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Nova Devolução',
}

export default async function DevolucaoPage() {
  const supabase = await createClient()

  const { data: movimentacoes } = await supabase
    .from('movimentacoes')
    .select(`
      id,
      quantidade,
      data_movimentacao,
      data_prevista_devolucao,
      motivo,
      local_uso,
      ferramenta:ferramentas(id, codigo, nome),
      colaborador:colaboradores(id, nome, cpf, cargo)
    `)
    .eq('tipo', 'retirada')
    .eq('status', 'pendente')
    .order('data_movimentacao', { ascending: false })

  const pendentes = movimentacoes ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Devolução</h1>
        <p className="text-muted-foreground">
          Registre a devolução de uma ferramenta
        </p>
      </div>

      {pendentes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Nenhuma retirada pendente</h3>
            <p className="text-sm text-muted-foreground">
              Não há ferramentas aguardando devolução no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <DevolucaoForm movimentacoesPendentes={pendentes} />
      )}
    </div>
  )
}
