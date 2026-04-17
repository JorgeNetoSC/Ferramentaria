import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wrench,
  Users,
  ArrowUpFromLine,
  ArrowDownToLine,
  AlertTriangle,
  Package,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalFerramentas },
    { data: ferramentasData },
    { count: totalColaboradores },
    { count: colaboradoresAtivos },
    { count: retiradasHoje },
    { count: devolucoesHoje },
    { count: alertasPendentes },
    { count: retiradasPendentes },
    { data: recentMovimentacoes },
    { data: alertasRecentes },
  ] = await Promise.all([
    supabase.from('ferramentas').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('ferramentas').select('quantidade_disponivel, quantidade_total, estado_conservacao').eq('ativo', true),
    supabase.from('colaboradores').select('*', { count: 'exact', head: true }),
    supabase.from('colaboradores').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'retirada').gte('data_movimentacao', today),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'devolucao').gte('data_movimentacao', today),
    supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('lido', false),
    supabase.from('movimentacoes').select('*', { count: 'exact', head: true }).eq('tipo', 'retirada').eq('status', 'pendente'),
    supabase.from('movimentacoes').select('*, ferramenta:ferramentas(nome, codigo), colaborador:colaboradores(nome)').order('created_at', { ascending: false }).limit(5),
    supabase.from('alertas').select('*').eq('lido', false).order('created_at', { ascending: false }).limit(5),
  ])

  // Calculate stats from ferramentas data
  let ferramentasDisponiveis = 0
  let ferramentasEmUso = 0
  let ferramentasManutencao = 0

  ferramentasData?.forEach(f => {
    if (f.estado_conservacao === 'em_manutencao') {
      ferramentasManutencao++
    } else if (f.quantidade_disponivel > 0) {
      ferramentasDisponiveis++
    }
    if (f.quantidade_disponivel < f.quantidade_total) {
      ferramentasEmUso++
    }
  })

  return {
    stats: {
      totalFerramentas: totalFerramentas ?? 0,
      ferramentasDisponiveis,
      ferramentasEmUso,
      ferramentasManutencao,
      totalColaboradores: totalColaboradores ?? 0,
      colaboradoresAtivos: colaboradoresAtivos ?? 0,
      retiradasHoje: retiradasHoje ?? 0,
      devolucoesHoje: devolucoesHoje ?? 0,
      alertasPendentes: alertasPendentes ?? 0,
      retiradasPendentes: retiradasPendentes ?? 0,
    },
    recentMovimentacoes: recentMovimentacoes ?? [],
    alertasRecentes: alertasRecentes ?? [],
  }
}

export default async function DashboardPage() {
  const { stats, recentMovimentacoes, alertasRecentes } = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do controle de ferramentas
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/retirada">
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Nova Retirada
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ferramentas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFerramentas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ferramentasDisponiveis} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colaboradoresAtivos}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalColaboradores} cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retiradasPendentes}</div>
            <p className="text-xs text-muted-foreground">
              ferramentas retiradas
            </p>
          </CardContent>
        </Card>

        <Card className={stats.alertasPendentes > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.alertasPendentes > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.alertasPendentes > 0 ? 'text-destructive' : ''}`}>
              {stats.alertasPendentes}
            </div>
            <p className="text-xs text-muted-foreground">
              pendentes de resolução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ArrowUpFromLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.retiradasHoje}</p>
              <p className="text-sm text-muted-foreground">Retiradas hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <ArrowDownToLine className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.devolucoesHoje}</p>
              <p className="text-sm text-muted-foreground">Devoluções hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ferramentasManutencao}</p>
              <p className="text-sm text-muted-foreground">Em manutenção</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-muted">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ferramentasEmUso}</p>
              <p className="text-sm text-muted-foreground">Ferramentas em uso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Movimentações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Movimentações Recentes</CardTitle>
              <CardDescription>Últimas retiradas e devoluções</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/historico">
                Ver todas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMovimentacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma movimentação registrada
              </p>
            ) : (
              <div className="space-y-4">
                {recentMovimentacoes.map((mov: any) => (
                  <div key={mov.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${mov.tipo === 'retirada' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      {mov.tipo === 'retirada' ? (
                        <ArrowUpFromLine className={`h-4 w-4 ${mov.tipo === 'retirada' ? 'text-primary' : 'text-accent'}`} />
                      ) : (
                        <ArrowDownToLine className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mov.ferramenta?.nome || 'Ferramenta'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mov.colaborador?.nome || 'Colaborador'}
                      </p>
                    </div>
                    <Badge variant={mov.tipo === 'retirada' ? 'default' : 'secondary'}>
                      {mov.tipo === 'retirada' ? 'Retirada' : 'Devolução'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Notificações pendentes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alertas">
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {alertasRecentes.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta pendente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertasRecentes.map((alerta: any) => (
                  <div key={alerta.id} className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      alerta.tipo === 'atraso_devolucao' ? 'bg-destructive/10' :
                      alerta.tipo === 'estoque_baixo' ? 'bg-warning/10' : 'bg-muted'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        alerta.tipo === 'atraso_devolucao' ? 'text-destructive' :
                        alerta.tipo === 'estoque_baixo' ? 'text-warning' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alerta.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alerta.mensagem}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
