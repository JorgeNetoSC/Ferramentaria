import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Package, AlertTriangle, Wrench, CheckCircle, Tag, DollarSign, Building, Truck } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Estoque',
}

export default async function EstoquePage() {
  const supabase = await createClient()

  const [{ data: ferramentas }, { data: categorias }] = await Promise.all([
    supabase
      .from('ferramentas')
      .select('*, categoria:categorias(id, nome)')
      .eq('ativo', true)
      .order('nome'),
    supabase
      .from('categorias')
      .select('*')
      .order('nome'),
  ])

  const totalFerramentas = ferramentas?.length ?? 0
  const ferramentasDisponiveis = ferramentas?.filter(f =>
    f.quantidade_disponivel > 0 && f.estado_conservacao !== 'em_manutencao'
  ).length ?? 0
  const ferramentasEmUso = ferramentas?.filter(f =>
    f.quantidade_disponivel === 0 && f.estado_conservacao !== 'em_manutencao'
  ).length ?? 0
  const ferramentasManutencao = ferramentas?.filter(f =>
    f.estado_conservacao === 'em_manutencao'
  ).length ?? 0

  // ==========================================
  // CÁLCULOS FINANCEIROS DO PATRIMÔNIO
  // ==========================================
  const financeiro = (ferramentas ?? []).reduce(
    (acc, f) => {
      const valorUnitario = Number(f.valor_unitario) || 0
      const total = f.quantidade_total || 0
      const disponivel = f.quantidade_disponivel || 0
      const emCampo = total - disponivel

      acc.patrimonioTotal += total * valorUnitario
      acc.emEstoque += disponivel * valorUnitario
      acc.emCampo += emCampo * valorUnitario

      return acc
    },
    { patrimonioTotal: 0, emEstoque: 0, emCampo: 0 }
  )

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  // Por categoria — conta ferramentas disponíveis e em uso
  const byCategory = categorias?.map(cat => {
    const items = ferramentas?.filter(f => f.categoria_id === cat.id) ?? []
    const disponiveis = items.filter(f => f.quantidade_disponivel > 0 && f.estado_conservacao !== 'em_manutencao').length
    const emUso = items.filter(f => f.quantidade_disponivel === 0 && f.estado_conservacao !== 'em_manutencao').length
    const manutencao = items.filter(f => f.estado_conservacao === 'em_manutencao').length
    return {
      ...cat,
      total: items.length,
      disponiveis,
      emUso,
      manutencao,
    }
  }) ?? []

  const getStatusBadge = (f: any) => {
    if (f.estado_conservacao === 'em_manutencao') return <Badge variant="destructive">Manutenção</Badge>
    if (f.quantidade_disponivel === 0) return <Badge variant="outline">Em Uso</Badge>
    return <Badge variant="default">Disponível</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground">Visão geral do estoque de ferramentas</p>
      </div>

      {/* Stats Cards (Quantidades) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFerramentas}</p>
              <p className="text-sm text-muted-foreground">Total de Ferramentas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{ferramentasDisponiveis}</p>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{ferramentasEmUso}</p>
              <p className="text-sm text-muted-foreground">Em Uso</p>
            </div>
          </CardContent>
        </Card>

        <Card className={ferramentasManutencao > 0 ? 'border-orange-500/50' : ''}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <AlertTriangle className={`h-6 w-6 ${ferramentasManutencao > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${ferramentasManutencao > 0 ? 'text-orange-500' : ''}`}>{ferramentasManutencao}</p>
              <p className="text-sm text-muted-foreground">Em Manutenção</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          NOVA SEÇÃO: DASHBOARD FINANCEIRO 
         ========================================== */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patrimônio Total</p>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">{formatarMoeda(financeiro.patrimonioTotal)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor em Estoque</p>
              <p className="text-2xl font-extrabold tracking-tight text-green-600 mt-0.5">{formatarMoeda(financeiro.emEstoque)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor em Campo</p>
              <p className="text-2xl font-extrabold tracking-tight text-blue-600 mt-0.5">{formatarMoeda(financeiro.emCampo)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Por Categoria</CardTitle>
          <CardDescription>Distribuição e status por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria cadastrada</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {byCategory.map((cat) => (
                <div key={cat.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{cat.nome}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{cat.total} itens</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Disponíveis</span>
                      <span className="text-green-500 font-medium">{cat.disponiveis}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Em Uso</span>
                      <span className="text-blue-500 font-medium">{cat.emUso}</span>
                    </div>
                    {cat.manutencao > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Manutenção</span>
                        <span className="text-orange-500 font-medium">{cat.manutencao}</span>
                      </div>
                    )}
                  </div>
                  <Progress
                    value={cat.total > 0 ? (cat.disponiveis / cat.total) * 100 : 0}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista completa */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Ferramentas</CardTitle>
          <CardDescription>Lista completa do estoque ativo</CardDescription>
        </CardHeader>
        <CardContent>
          {!ferramentas || ferramentas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ferramenta cadastrada</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {ferramentas.map((f: any) => (
                <Link
                  key={f.id}
                  href={`/ferramentas/${f.id}`}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{f.nome}</p>
                      <p className="text-xs text-muted-foreground font-mono">{f.codigo}</p>
                      {f.categoria && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {f.categoria.nome}
                        </Badge>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {getStatusBadge(f)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}