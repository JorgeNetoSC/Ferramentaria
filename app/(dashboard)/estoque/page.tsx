import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Package, AlertTriangle, Wrench, CheckCircle } from 'lucide-react'
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

  // Calculate stats
  const totalFerramentas = ferramentas?.length ?? 0
  const ferramentasDisponiveis = ferramentas?.filter(f => 
    f.quantidade_disponivel > 0 && f.estado_conservacao !== 'em_manutencao'
  ).length ?? 0
  const ferramentasEmUso = ferramentas?.filter(f => 
    f.quantidade_disponivel < f.quantidade_total
  ).length ?? 0
  const ferramentasManutencao = ferramentas?.filter(f => 
    f.estado_conservacao === 'em_manutencao'
  ).length ?? 0
  const estoquesBaixos = ferramentas?.filter(f => 
    f.quantidade_disponivel <= 2 && f.quantidade_disponivel > 0 && f.estado_conservacao !== 'em_manutencao'
  ) ?? []

  // Group by category
  const byCategory = categorias?.map(cat => {
    const items = ferramentas?.filter(f => f.categoria_id === cat.id) ?? []
    const total = items.reduce((acc, f) => acc + f.quantidade_total, 0)
    const disponivel = items.reduce((acc, f) => acc + f.quantidade_disponivel, 0)
    return {
      ...cat,
      total,
      disponivel,
      items: items.length,
    }
  }) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground">
          Visão geral do estoque de ferramentas
        </p>
      </div>

      {/* Stats Cards */}
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

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-accent/20">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ferramentasDisponiveis}</p>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ferramentasEmUso}</p>
              <p className="text-sm text-muted-foreground">Em Uso</p>
            </div>
          </CardContent>
        </Card>

        <Card className={ferramentasManutencao > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ferramentasManutencao}</p>
              <p className="text-sm text-muted-foreground">Em Manutenção</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
            <CardDescription>Distribuição de ferramentas por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria cadastrada
              </p>
            ) : (
              byCategory.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {cat.disponivel}/{cat.total}
                    </span>
                  </div>
                  <Progress 
                    value={cat.total > 0 ? (cat.disponivel / cat.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Estoque Baixo */}
        <Card className={estoquesBaixos.length > 0 ? 'border-warning/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${estoquesBaixos.length > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
              Estoque Baixo
            </CardTitle>
            <CardDescription>
              Ferramentas com quantidade disponível baixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estoquesBaixos.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma ferramenta com estoque baixo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {estoquesBaixos.map((f: any) => (
                  <Link
                    key={f.id}
                    href={`/ferramentas/${f.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{f.nome}</p>
                      <p className="text-xs text-muted-foreground">{f.codigo}</p>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning">
                      {f.quantidade_disponivel}/{f.quantidade_total}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista completa */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Ferramentas</CardTitle>
          <CardDescription>Lista completa do estoque</CardDescription>
        </CardHeader>
        <CardContent>
          {!ferramentas || ferramentas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma ferramenta cadastrada
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {ferramentas.map((f: any) => (
                <Link
                  key={f.id}
                  href={`/ferramentas/${f.id}`}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{f.nome}</p>
                      <p className="text-xs text-muted-foreground">{f.codigo}</p>
                      {f.categoria && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {f.categoria.nome}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        f.quantidade_disponivel === 0 
                          ? 'text-destructive' 
                          : f.quantidade_disponivel <= 2 
                            ? 'text-warning' 
                            : 'text-primary'
                      }`}>
                        {f.quantidade_disponivel}
                      </p>
                      <p className="text-xs text-muted-foreground">/{f.quantidade_total}</p>
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
