'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Ferramenta, Categoria, FerramentaFormData, EstadoConservacao } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface FerramentaFormProps {
  ferramenta?: Ferramenta
  categorias: Categoria[]
  mode: 'create' | 'edit'
}

const estadoOptions: { value: EstadoConservacao; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'ruim', label: 'Ruim' },
  { value: 'em_manutencao', label: 'Em Manutenção' },
]

export function FerramentaForm({ ferramenta, categorias, mode }: FerramentaFormProps) {
  const [formData, setFormData] = useState<FerramentaFormData>({
    codigo: ferramenta?.codigo ?? '',
    nome: ferramenta?.nome ?? '',
    descricao: ferramenta?.descricao ?? '',
    categoria_id: ferramenta?.categoria_id ?? undefined,
    marca: ferramenta?.marca ?? '',
    modelo: ferramenta?.modelo ?? '',
    numero_serie: ferramenta?.numero_serie ?? '',
    valor_unitario: ferramenta?.valor_unitario ?? undefined,
    quantidade_total: ferramenta?.quantidade_total ?? 1,
    localizacao: ferramenta?.localizacao ?? '',
    estado_conservacao: ferramenta?.estado_conservacao ?? 'bom',
    data_aquisicao: ferramenta?.data_aquisicao ?? '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoria_id' && value === 'none') {
      setFormData((prev) => ({ ...prev, [name]: undefined }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? undefined : parseFloat(value)
    setFormData((prev) => ({ ...prev, [name]: numValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const payload = {
      ...formData,
      descricao: formData.descricao || null,
      categoria_id: formData.categoria_id || null,
      marca: formData.marca || null,
      modelo: formData.modelo || null,
      numero_serie: formData.numero_serie || null,
      valor_unitario: formData.valor_unitario || null,
      localizacao: formData.localizacao || null,
      estado_conservacao: formData.estado_conservacao || null,
      data_aquisicao: formData.data_aquisicao || null,
      quantidade_disponivel: mode === 'create' ? formData.quantidade_total : undefined,
    }

    if (mode === 'create') {
      const { error } = await supabase.from('ferramentas').insert(payload)

      if (error) {
        if (error.code === '23505') {
          toast.error('Código já cadastrado')
        } else {
          toast.error('Erro ao criar ferramenta')
          console.error(error)
        }
        setIsLoading(false)
        return
      }

      toast.success('Ferramenta criada com sucesso')
    } else {
      const { quantidade_disponivel, ...updatePayload } = payload
      const { error } = await supabase
        .from('ferramentas')
        .update(updatePayload)
        .eq('id', ferramenta!.id)

      if (error) {
        toast.error('Erro ao atualizar ferramenta')
        console.error(error)
        setIsLoading(false)
        return
      }

      toast.success('Ferramenta atualizada com sucesso')
    }

    router.push('/ferramentas')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Nova Ferramenta' : 'Editar Ferramenta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ex: FER-001"
                required
                disabled={isLoading || mode === 'edit'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome da ferramenta"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao ?? ''}
                onChange={handleChange}
                placeholder="Descrição detalhada da ferramenta"
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria_id">Categoria</Label>
              <Select
                value={formData.categoria_id ?? 'none'}
                onValueChange={(v) => handleSelectChange('categoria_id', v)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
              <Select
                value={formData.estado_conservacao ?? 'bom'}
                onValueChange={(v) => handleSelectChange('estado_conservacao', v)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                name="marca"
                value={formData.marca ?? ''}
                onChange={handleChange}
                placeholder="Ex: Bosch, DeWalt"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                name="modelo"
                value={formData.modelo ?? ''}
                onChange={handleChange}
                placeholder="Modelo da ferramenta"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input
                id="numero_serie"
                name="numero_serie"
                value={formData.numero_serie ?? ''}
                onChange={handleChange}
                placeholder="Número de série"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_unitario">Valor Unitário (R$)</Label>
              <Input
                id="valor_unitario"
                name="valor_unitario"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_unitario ?? ''}
                onChange={handleNumberChange}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade_total">Quantidade *</Label>
              <Input
                id="quantidade_total"
                name="quantidade_total"
                type="number"
                min="1"
                value={formData.quantidade_total}
                onChange={handleNumberChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                name="localizacao"
                value={formData.localizacao ?? ''}
                onChange={handleChange}
                placeholder="Ex: Almoxarifado A, Prateleira 3"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
              <Input
                id="data_aquisicao"
                name="data_aquisicao"
                type="date"
                value={formData.data_aquisicao ?? ''}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" asChild disabled={isLoading}>
              <Link href="/ferramentas">
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
                  {mode === 'create' ? 'Criar Ferramenta' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
