import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CatalogoList } from './catalogo-list'

export const metadata = { title: 'Catálogo' }
export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const supabase = await createClient()

  const { data: itens } = await supabase
    .from('catalogo')
    .select('*, kit:catalogo_kit(*)')
    .order('nome')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-muted-foreground">Ferramentas e equipamentos disponíveis</p>
        </div>
        <Button asChild>
          <Link href="/catalogo/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Link>
        </Button>
      </div>

      <CatalogoList initialItens={itens ?? []} />
    </div>
  )
}