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
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
export const revalidate = 0 
export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { data: ferramentasData },
    { count: alertasPendentes },
    { data: recentMovimentacoes },
    { data: alertasRecentes },
  ] = await Promise.all([
    // Buscamos os dados numéricos reais de cada ferramenta
    supabase.from('ferramentas')
      .select('quantidade_disponivel, quantidade_total, estado_conservacao')
      .eq('ativo', true),
    supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('lido', false),
    supabase.from('movimentacoes')
      .select('*, ferramenta:ferramentas(nome, codigo), colaborador:colaboradores(nome)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('alertas').select('*').eq('lido', false).order('created_at', { ascending: false }).limit(5),
  ])

  // Inicializamos os acumuladores como zero
 let patrimonioTotal = 0
  let disponivelEmEstoque = 0
  let ferramentasManutencao = 0

  ferramentasData?.forEach(f => {
    const total = Number(f.quantidade_total || 0)
    // TRAVA: O disponível nunca pode ser maior que o total daquela linha
    const disponivelBruto = Number(f.quantidade_disponivel || 0)
    const disponivelReal = disponivelBruto > total ? total : disponivelBruto

    patrimonioTotal += total
    
    if (f.estado_conservacao === 'em_manutencao') {
      ferramentasManutencao += total
    } else {
      disponivelEmEstoque += disponivelReal
    }
  })

  return {
    stats: {
      patrimonioTotal, // Soma real de todas as unidades
      disponivelEmEstoque, // Apenas o que está na prateleira e pronto p/ uso
      ferramentasManutencao, // Itens estragados
      alertasPendentes: alertasPendentes ?? 0,
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
          <p className="text-muted-foreground">Controle de Inventário Eagle Soluções</p>
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

      {/* Cards Principais de Estado */}
      {/* Stats Cards - Foco em Inventário */}
<div className="grid gap-4 md:grid-cols-3">
  {/* Card Total de Patrimônio */}
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
      <Package className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.patrimonioTotal}</div>
      <p className="text-xs text-muted-foreground">
        Total de itens cadastrados no sistema
      </p>
    </CardContent>
  </Card>

  {/* Card Disponíveis (O que pode ser retirado agora) */}
  <Card className="border-primary/20 bg-primary/5">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-primary">Disponíveis para Uso</CardTitle>
      <Wrench className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{stats.disponivelEmEstoque}</div>
      <p className="text-xs text-muted-foreground">
        Itens prontos na prateleira
      </p>
    </CardContent>
  </Card>

  {/* Card Manutenção (O que está indisponível) */}
  <Card className={stats.ferramentasManutencao > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
      <Clock className={`h-4 w-4 ${stats.ferramentasManutencao > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${stats.ferramentasManutencao > 0 ? 'text-orange-500' : ''}`}>
        {stats.ferramentasManutencao}
      </div>
      <p className="text-xs text-muted-foreground">
        Itens aguardando reparo
      </p>
    </CardContent>
  </Card>
</div>

      

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Movimentações Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico Recente</CardTitle>
              <CardDescription>Movimentações nas últimas horas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/historico">Ver todas <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMovimentacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma movimentação hoje</p>
            ) : (
              <div className="space-y-4">
                {recentMovimentacoes.map((mov: any) => (
                  <div key={mov.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${mov.tipo === 'retirada' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      {mov.tipo === 'retirada' ? 
                        <ArrowUpFromLine className="h-4 w-4 text-primary" /> : 
                        <ArrowDownToLine className="h-4 w-4 text-accent" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{mov.ferramenta?.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{mov.colaborador?.nome}</p>
                    </div>
                    <Badge variant={mov.tipo === 'retirada' ? 'default' : 'outline'}>
                      {mov.tipo === 'retirada' ? 'Saída' : 'Entrada'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertas Críticos</CardTitle>
              <CardDescription>Necessitam atenção imediata</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alertas">Ver todos <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {alertasRecentes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Tudo em ordem no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertasRecentes.map((alerta: any) => (
                  <div key={alerta.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alerta.titulo}</p>
                      <p className="text-xs text-muted-foreground">{alerta.mensagem}</p>
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