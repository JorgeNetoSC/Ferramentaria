import { createClient } from '@/lib/supabase/server'
import { HistoricoList } from './historico-list'

export const metadata = {
  title: 'Histórico',
}

export default async function HistoricoPage() {
  const supabase = await createClient()

  const { data: movimentacoes } = await supabase
    .from('movimentacoes')
    .select(`
      *,
      ferramenta:ferramentas(id, codigo, nome),
      colaborador:colaboradores(id, nome, cpf, cargo, setor)
    `)
    .order('data_movimentacao', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Histórico completo de movimentações
        </p>
      </div>

      <HistoricoList movimentacoes={movimentacoes ?? []} />
    </div>
  )
}
