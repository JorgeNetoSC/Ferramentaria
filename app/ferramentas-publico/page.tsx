// 1. Mude o import para usar o seu utilitário de servidor
import { createClient } from '@/lib/supabase/server'
import FerramentasPublicoClient from '@/components/ferramentas-publico-client'

export const dynamic = 'force-dynamic'

export default async function FerramentasPublicoPage() {
  const supabase = await createClient()

  const [{ data: ferramentasRaw }, { data: categorias }] = await Promise.all([
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

  // Trata o campo categoria para garantir que seja um objeto único (ou null), não um array
  const ferramentas = ferramentasRaw?.map(f => ({
    ...f,
    categoria: Array.isArray(f.categoria) ? f.categoria[0] : f.categoria
  }))

  return (
    <FerramentasPublicoClient
      // Usamos 'as any' aqui apenas para o TS relaxar na validação final do objeto formatado
      ferramentas={(ferramentas as any) ?? []}
      categorias={categorias ?? []}
    />
  )
}