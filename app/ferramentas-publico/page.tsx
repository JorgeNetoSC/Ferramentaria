import { createClient } from '@supabase/supabase-js'
import FerramentasPublicoClient from '@/components/ferramentas-publico-client'

export const dynamic = 'force-dynamic'

export default async function FerramentasPublicoPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: ferramentas }, { data: categorias }] = await Promise.all([
    supabase
      .from('ferramentas')
      .select('id, nome, codigo, marca, modelo, quantidade_disponivel, quantidade_total, estado_conservacao, categoria_id, categoria:categorias(nome)')
      .eq('ativo', true)
      .gt('quantidade_disponivel', 0)
      .neq('estado_conservacao', 'em_manutencao')
      .order('nome'),
    supabase
      .from('categorias')
      .select('id, nome')
      .order('nome'),
  ])

  return (
    <FerramentasPublicoClient
      ferramentas={ferramentas ?? []}
      categorias={categorias ?? []}
    />
  )
}