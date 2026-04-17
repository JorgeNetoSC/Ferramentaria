import { createClient } from '@/lib/supabase/server'
import { RetiradaForm } from './retirada-form'

export const metadata = {
  title: 'Nova Retirada',
}

export default async function RetiradaPage() {
  const supabase = await createClient()

  const [{ data: ferramentas }, { data: colaboradores }] = await Promise.all([
    supabase
      .from('ferramentas')
      .select('id, codigo, nome, quantidade_disponivel, estado_conservacao')
      .eq('ativo', true)
      .gt('quantidade_disponivel', 0)
      .neq('estado_conservacao', 'em_manutencao')
      .order('nome'),
    supabase
      .from('colaboradores')
      .select('id, nome, cpf, cargo, setor')
      .eq('ativo', true)
      .order('nome'),
  ])
  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Retirada</h1>
        <p className="text-muted-foreground">
          Registre a retirada de uma ferramenta
        </p>
      </div>

      <RetiradaForm 
        ferramentas={ferramentas ?? []} 
        colaboradores={colaboradores ?? []}
      />
    </div>
  )
}
