import { createClient } from '@/lib/supabase/server'
import { FerramentasList } from './ferramentas-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Ferramentas',
}

export default async function FerramentasPage() {
  const supabase = await createClient()

  const [{ data: ferramentas }, { data: categorias }] = await Promise.all([
    supabase
      .from('ferramentas')
      .select('*, categoria:categorias(id, nome)')
      .order('nome'),
    supabase
      .from('categorias')
      .select('*')
      .order('nome'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferramentas</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de ferramentas e equipamentos
          </p>
        </div>
        <Button asChild>
          <Link href="/ferramentas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Ferramenta
          </Link>
        </Button>
      </div>


      <FerramentasList 
        initialFerramentas={ferramentas ?? []} 
        categorias={categorias ?? []}
      />
      
    </div>
    
  )
}
