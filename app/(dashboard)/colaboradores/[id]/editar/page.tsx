import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ColaboradorForm } from '../../colaborador-form'

export const metadata = {
  title: 'Editar Colaborador',
}

export default async function EditarColaboradorPage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Colaborador</h1>
        <p className="text-muted-foreground">
          Atualize os dados do colaborador
        </p>
      </div>

      <ColaboradorForm colaborador={colaborador} mode="edit" />
    </div>
  )
}
