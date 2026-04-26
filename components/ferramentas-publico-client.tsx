'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Wrench, Package, CheckCircle2, Tag, Search, Filter } from 'lucide-react'

interface Ferramenta {
  id: string
  nome: string
  codigo: string
  marca?: string
  modelo?: string
  quantidade_disponivel: number
  quantidade_total: number
  categoria_id?: string
  categoria?: { nome: string } | null
}

interface Categoria {
  id: string
  nome: string
}

interface Props {
  ferramentas: Ferramenta[]
  categorias: Categoria[]
}

export default function FerramentasPublicoClient({ ferramentas, categorias }: Props) {
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all')

  const filtradas = useMemo(() => {
    return ferramentas.filter((f) => {
      const matchSearch =
        f.nome.toLowerCase().includes(search.toLowerCase()) ||
        f.codigo.toLowerCase().includes(search.toLowerCase()) ||
        (f.marca?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchCategoria =
        categoriaFiltro === 'all' || f.categoria_id === categoriaFiltro

      return matchSearch && matchCategoria
    })
  }, [ferramentas, search, categoriaFiltro])

  const total = filtradas.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wrench className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ferramentas Disponíveis</h1>
              <p className="text-sm text-muted-foreground">Eagle Soluções — Atualizado em tempo real</p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">{total} disponíve{total === 1 ? 'l' : 'is'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center border-b border-border">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setCategoriaFiltro('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoriaFiltro === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoriaFiltro === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-6 rounded-full bg-muted">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold">Nenhuma ferramenta encontrada</p>
            <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtradas.map((f) => (
              <div
                key={f.id}
                className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {f.quantidade_disponivel}/{f.quantidade_total}
                  </span>
                </div>

                <div className="mb-4 p-2.5 rounded-xl bg-primary/10 w-fit">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>

                <h3 className="font-semibold text-base leading-tight mb-1 pr-16">{f.nome}</h3>
                <p className="text-xs text-muted-foreground font-mono mb-3">{f.codigo}</p>

                <div className="space-y-1 mb-4">
                  {f.marca && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Marca:</span> {f.marca}
                    </p>
                  )}
                  {f.modelo && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Modelo:</span> {f.modelo}
                    </p>
                  )}
                </div>

                {f.categoria?.nome && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{f.categoria.nome}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}