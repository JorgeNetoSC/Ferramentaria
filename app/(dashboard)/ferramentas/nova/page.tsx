import { createClient } from '@/lib/supabase/server'
import { FerramentaForm } from '../ferramenta-form'

export const metadata = {
  title: 'Nova Ferramenta',
}

export default async function NovaFerramentaPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nome')
    .neq('estado_conservacao', 'em_manutencao')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Ferramenta</h1>
        <p className="text-muted-foreground">
          Cadastre uma nova ferramenta no sistema
        </p>
      </div>

      <FerramentaForm mode="create" categorias={categorias ?? []} />
    </div>
  )
}
