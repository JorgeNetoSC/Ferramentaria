import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Wrench, MapPin, Calendar, DollarSign, Hash, Package } from 'lucide-react'

export const metadata = {
  title: 'Detalhes da Ferramenta',
}

const estadoLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  novo: { label: 'Novo', variant: 'default' },
  bom: { label: 'Bom', variant: 'secondary' },
  regular: { label: 'Regular', variant: 'outline' },
  ruim: { label: 'Ruim', variant: 'destructive' },
  em_manutencao: { label: 'Em Manutenção', variant: 'destructive' },
}

export default async function FerramentaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ferramenta, error } = await supabase
    .from('ferramentas')
    .select('*, categoria:categorias(nome)')
    .eq('id', id)
    .single()

  if (error || !ferramenta) {
    notFound()
  }

  // Get recent movimentações
  const { data: movimentacoes } = await supabase
    .from('movimentacoes')
    .select('*, colaborador:colaboradores(nome)')
    .eq('ferramenta_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ferramentas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{ferramenta.codigo}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{ferramenta.nome}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ferramenta.estado_conservacao && (
            <Badge variant={estadoLabels[ferramenta.estado_conservacao]?.variant || 'outline'}>
              {estadoLabels[ferramenta.estado_conservacao]?.label || ferramenta.estado_conservacao}
            </Badge>
          )}
          <Button asChild>
            <Link href={`/ferramentas/${ferramenta.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações da Ferramenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ferramenta.descricao && (
              <p className="text-sm text-muted-foreground">{ferramenta.descricao}</p>
            )}

            <div className="grid gap-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Categoria</span>
                <Badge variant="outline">
                  {ferramenta.categoria?.nome || 'Sem categoria'}
                </Badge>
              </div>

              {ferramenta.marca && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Marca</span>
                  <span className="text-sm font-medium">{ferramenta.marca}</span>
                </div>
              )}

              {ferramenta.modelo && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Modelo</span>
                  <span className="text-sm font-medium">{ferramenta.modelo}</span>
                </div>
              )}

              {ferramenta.numero_serie && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Nº Série
                  </span>
                  <span className="text-sm font-mono">{ferramenta.numero_serie}</span>
                </div>
              )}

              {ferramenta.localizacao && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localização
                  </span>
                  <span className="text-sm">{ferramenta.localizacao}</span>
                </div>
              )}

              {ferramenta.valor_unitario && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Valor
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(ferramenta.valor_unitario)}</span>
                </div>
              )}

              {ferramenta.data_aquisicao && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Aquisição
                  </span>
                  <span className="text-sm">{formatDate(ferramenta.data_aquisicao)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estoque */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold">{ferramenta.quantidade_total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <p className="text-3xl font-bold text-primary">{ferramenta.quantidade_disponivel}</p>
                  <p className="text-sm text-muted-foreground">Disponível</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {ferramenta.quantidade_total - ferramenta.quantidade_disponivel} em uso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {!movimentacoes || movimentacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma movimentação registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {movimentacoes.map((mov: any) => (
                    <div key={mov.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{mov.colaborador?.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(mov.data_movimentacao)}
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
        </div>
      </div>
    </div>
  )
}
