import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CatalogoForm } from '../../catalogo-form'

export const metadata = { title: 'Editar Item' }

export default async function EditarCatalogoPage({ 
  params 
}: { 
  params: Promise<{ id: string }> // Tipagem correta para Next 15
}) {
  const { id } = await params; // Unwrapping da promise

  const supabase = await createClient()

  const { data: item } = await supabase
    .from('catalogo')
    .select('*, kit:catalogo_kit(*)')
    .eq('id', id) // Use o id extraído aqui
    .single()

  if (!item) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Item</h1>
        <p className="text-muted-foreground">Atualize as informações do item</p>
      </div>
      <CatalogoForm mode="edit" item={item} />
    </div>
  )
}