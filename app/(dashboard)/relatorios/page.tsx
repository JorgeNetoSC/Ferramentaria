import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  Wrench,
  Calendar,
  ArrowUpFromLine,
  ArrowDownToLine,
  AlertTriangle,
} from 'lucide-react'

export const metadata = {
  title: 'Relatórios',
}

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // 🔥 REMOVIDO .catch() e tratado corretamente
  const [
    { count: totalFerramentas },
    { count: totalColaboradores },
    { count: retiradasMes },
    { count: devolucoesMes },
    { count: retiradasMesPassado },
    { count: devolucoesMesPassado },
    resTopFerramentas,
    resTopColaboradores,
    { data: retiradasAtrasadas },
  ] = await Promise.all([
    supabase.from('ferramentas').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('colaboradores').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'retirada').gte('data_movimentacao', startOfMonth),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'devolucao').gte('data_movimentacao', startOfMonth),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'retirada').gte('data_movimentacao', startOfLastMonth).lte('data_movimentacao', endOfLastMonth),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'devolucao').gte('data_movimentacao', startOfLastMonth).lte('data_movimentacao', endOfLastMonth),
    supabase.rpc('get_top_ferramentas'),
    supabase.rpc('get_top_colaboradores'),
    supabase.from('movimentacoes')
      .select('*, ferramenta:ferramentas(nome, codigo), colaborador:colaboradores(nome)')
      .eq('tipo', 'retirada')
      .eq('status', 'pendente')
      .lt('data_prevista_devolucao', now.toISOString())
      .order('data_prevista_devolucao', { ascending: true })
      .limit(10),
  ])

  // ✅ tratamento correto de erro
  const topFerramentas = resTopFerramentas.error ? null : resTopFerramentas.data
  const topColaboradores = resTopColaboradores.error ? null : resTopColaboradores.data

  const retiradasVariacao =
    retiradasMesPassado && retiradasMesPassado > 0
      ? Math.round(((retiradasMes ?? 0) - retiradasMesPassado) / retiradasMesPassado * 100)
      : 0

  const devolucoesVariacao =
    devolucoesMesPassado && devolucoesMesPassado > 0
      ? Math.round(((devolucoesMes ?? 0) - devolucoesMesPassado) / devolucoesMesPassado * 100)
      : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysOverdue = (dateString: string) => {
    const diff = now.getTime() - new Date(dateString).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise e métricas do controle de ferramentas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas Ativas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFerramentas ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalColaboradores ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retiradas</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retiradasMes ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Devoluções</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devolucoesMes ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Atrasos */}
      <Card className={retiradasAtrasadas?.length ? 'border-destructive/50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${retiradasAtrasadas?.length ? 'text-destructive' : ''}`} />
            Devoluções Atrasadas
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!retiradasAtrasadas?.length ? (
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma devolução atrasada
            </p>
          ) : (
            <div className="space-y-3">
              {retiradasAtrasadas.map((mov: any) => (
                <div key={mov.id} className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium text-sm">{mov.ferramenta?.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {mov.colaborador?.nome}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {getDaysOverdue(mov.data_prevista_devolucao)} dias
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}