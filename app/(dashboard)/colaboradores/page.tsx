import { createClient } from '@/lib/supabase/server'
import { ColaboradoresList } from './colaboradores-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Colaboradores',
}

export default async function ColaboradoresPage() {
  const supabase = await createClient()

  const { data: colaboradores, error } = await supabase
    .from('colaboradores')
    .select('*')
    .order('nome')

  if (error) {
    console.error('Error fetching colaboradores:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie os colaboradores da empresa
          </p>
        </div>
        <Button asChild>
          <Link href="/colaboradores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Link>
        </Button>
      </div>

      <ColaboradoresList initialColaboradores={colaboradores ?? []} />
    </div>
  )
}
