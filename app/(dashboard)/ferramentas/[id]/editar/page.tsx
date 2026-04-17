import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FerramentaForm } from '../../ferramenta-form'

export const metadata = {
  title: 'Editar Ferramenta',
}

export default async function EditarFerramentaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: ferramenta }, { data: categorias }] = await Promise.all([
    supabase.from('ferramentas').select('*').eq('id', id).single(),
    supabase.from('categorias').select('*').order('nome'),
  ])

  if (!ferramenta) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Ferramenta</h1>
        <p className="text-muted-foreground">
          Atualize os dados da ferramenta
        </p>
      </div>

      <FerramentaForm 
        ferramenta={ferramenta} 
        categorias={categorias ?? []} 
        mode="edit" 
      />
    </div>
  )
}
