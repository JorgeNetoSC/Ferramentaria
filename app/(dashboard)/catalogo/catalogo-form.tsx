'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { PhotoUpload } from '@/components/photo-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface KitItem {
  id?: string
  quantidade: number
  componente: string
}

interface CatalogoItem {
  id: string
  nome: string
  descricao: string | null
  categoria: string | null
  foto_url: string | null
  kit: KitItem[]
}

interface CatalogoFormProps {
  mode: 'create' | 'edit'
  item?: CatalogoItem
}

export function CatalogoForm({ mode, item }: CatalogoFormProps) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [categoria, setCategoria] = useState(item?.categoria ?? '')
  const [fotoUrl, setFotoUrl] = useState<string | null>(item?.foto_url ?? null)
  const [kit, setKit] = useState<KitItem[]>(item?.kit ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addKitItem = () => {
    setKit([...kit, { quantidade: 1, componente: '' }])
  }

  const removeKitItem = (index: number) => {
    setKit(kit.filter((_, i) => i !== index))
  }

  const updateKitItem = (index: number, field: 'quantidade' | 'componente', value: string | number) => {
    setKit(kit.map((k, i) => i === index ? { ...k, [field]: value } : k))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    setIsLoading(true)

    try {
      if (mode === 'create') {
        const { data: novoItem, error } = await supabase
          .from('catalogo')
          .insert({
            nome: nome.trim(),
            descricao: descricao || null,
            categoria: categoria || null,
            foto_url: fotoUrl,
          })
          .select()
          .single()

        if (error) throw error

        // Insere kit
        if (kit.length > 0) {
          const kitValido = kit.filter(k => k.componente.trim())
          if (kitValido.length > 0) {
            const { error: kitError } = await supabase.from('catalogo_kit').insert(
              kitValido.map(k => ({
                catalogo_id: novoItem.id,
                quantidade: k.quantidade,
                componente: k.componente.trim(),
              }))
            )
            if (kitError) throw kitError
          }
        }

        toast.success('Item adicionado ao catálogo')
      } else {
        const { error } = await supabase
          .from('catalogo')
          .update({
            nome: nome.trim(),
            descricao: descricao || null,
            categoria: categoria || null,
            foto_url: fotoUrl,
          })
          .eq('id', item!.id)

        if (error) throw error

        // Deleta kit antigo e reinsere
        await supabase.from('catalogo_kit').delete().eq('catalogo_id', item!.id)

        if (kit.length > 0) {
          const kitValido = kit.filter(k => k.componente.trim())
          if (kitValido.length > 0) {
            const { error: kitError } = await supabase.from('catalogo_kit').insert(
              kitValido.map(k => ({
                catalogo_id: item!.id,
                quantidade: k.quantidade,
                componente: k.componente.trim(),
              }))
            )
            if (kitError) throw kitError
          }
        }

        toast.success('Item atualizado')
      }

      router.push('/catalogo')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados principais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: FURADEIRA/PARAFUSADEIRA DE IMPACTO A BATERIA 18V BOSCH"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Ferramentas a Bateria, Manuais, EPI/EPC"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Informações adicionais sobre o equipamento"
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Kit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Componentes do Kit</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKitItem}
                  disabled={isLoading}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>

              {kit.length === 0 ? (
                <p className="text-xs text-muted-foreground">Kit: N/A — sem componentes</p>
              ) : (
                <div className="space-y-2">
                  {kit.map((k, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="1"
                        value={k.quantidade}
                        onChange={(e) => updateKitItem(i, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-16 shrink-0"
                        disabled={isLoading}
                      />
                      <Input
                        value={k.componente}
                        onChange={(e) => updateKitItem(i, 'componente', e.target.value)}
                        placeholder="Descrição do componente"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeKitItem(i)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Foto */}
        <Card>
          <CardHeader>
            <CardTitle>Foto do Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              value={fotoUrl}
              onChange={setFotoUrl}
              folder="catalogo"
              label="Foto do equipamento"
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <Button type="button" variant="outline" asChild disabled={isLoading}>
          <Link href="/catalogo">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Adicionar ao Catálogo' : 'Salvar Alterações'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}