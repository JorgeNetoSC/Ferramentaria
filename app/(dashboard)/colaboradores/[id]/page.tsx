import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Mail, Phone, Building2, Calendar, User } from 'lucide-react'

export const metadata = {
  title: 'Detalhes do Colaborador',
}

export default async function ColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: colaborador, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !colaborador) {
    notFound()
  }

  // Get recent movimentações
  const { data: movimentacoes } = await supabase
    .from('movimentacoes')
    .select('*, ferramenta:ferramentas(nome, codigo)')
    .eq('colaborador_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/colaboradores">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{colaborador.nome}</h1>
            <p className="text-muted-foreground">
              {colaborador.cargo} - {colaborador.setor}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={colaborador.ativo ? 'default' : 'secondary'} className="text-sm">
            {colaborador.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button asChild>
            <Link href={`/colaboradores/${colaborador.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {colaborador.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-lg">{colaborador.nome}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  CPF: {formatCPF(colaborador.cpf)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 pt-4 border-t">
              {colaborador.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{colaborador.email}</span>
                </div>
              )}
              {colaborador.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatPhone(colaborador.telefone)}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{colaborador.cargo} - {colaborador.setor}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Admissão: {formatDate(colaborador.data_admissao)}</span>
              </div>
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
                      <p className="font-medium text-sm">{mov.ferramenta?.nome}</p>
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
  )
}
