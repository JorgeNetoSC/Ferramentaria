'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PhotoUpload } from '@/components/photo-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Check, ChevronsUpDown, User, Wrench } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FerramentaOption {
  id: string
  codigo: string
  nome: string
  quantidade_disponivel: number
  estado_conservacao: string | null
}

interface ColaboradorOption {
  id: string
  nome: string
  cpf: string
  cargo: string
  setor: string
}

interface RetiradaFormProps {
  ferramentas: FerramentaOption[]
  colaboradores: ColaboradorOption[]
}

export function RetiradaForm({ ferramentas, colaboradores }: RetiradaFormProps) {
  const [ferramentaId, setFerramentaId] = useState('')
  const [colaboradorId, setColaboradorId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [dataPrevista, setDataPrevista] = useState('')
  const [motivo, setMotivo] = useState('')
  const [localUso, setLocalUso] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ferramentaOpen, setFerramentaOpen] = useState(false)
  const [colaboradorOpen, setColaboradorOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedFerramenta = ferramentas.find(f => f.id === ferramentaId)
  const selectedColaborador = colaboradores.find(c => c.id === colaboradorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ferramentaId || !colaboradorId) {
      toast.error('Selecione a ferramenta e o colaborador')
      return
    }

    if (selectedFerramenta && quantidade > selectedFerramenta.quantidade_disponivel) {
      toast.error('Quantidade maior que o disponível em estoque')
      return
    }

    setIsLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Create movimentação
      const { error: movError } = await supabase
        .from('movimentacoes')
        .insert({
          tipo: 'retirada',
          ferramenta_id: ferramentaId,
          colaborador_id: colaboradorId,
          quantidade,
          data_prevista_devolucao: dataPrevista || null,
          motivo: motivo || null,
          local_uso: localUso || null,
          observacoes: observacoes || null,
          foto_retirada_url: fotoUrl,
          status: 'pendente',
          created_by: user?.id || null,
        })

      if (movError) throw movError

      // Update ferramenta stock
      const { error: stockError } = await supabase
        .from('ferramentas')
        .update({
          quantidade_disponivel: selectedFerramenta!.quantidade_disponivel - quantidade,
        })
        .eq('id', ferramentaId)

      if (stockError) throw stockError

      toast.success('Retirada registrada com sucesso')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao registrar retirada')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seleção de Ferramenta e Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Retirada</CardTitle>
            <CardDescription>
              Selecione a ferramenta e o colaborador responsável
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ferramenta */}
            <div className="space-y-2">
              <Label>Ferramenta *</Label>
              <Popover open={ferramentaOpen} onOpenChange={setFerramentaOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={ferramentaOpen}
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedFerramenta ? (
                      <span className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        {selectedFerramenta.codigo} - {selectedFerramenta.nome}
                      </span>
                    ) : (
                      'Selecione uma ferramenta...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar ferramenta..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma ferramenta encontrada</CommandEmpty>
                      <CommandGroup>
                        {ferramentas.map((f) => (
                          <CommandItem
                            key={f.id}
                            value={`${f.codigo} ${f.nome}`}
                            onSelect={() => {
                              setFerramentaId(f.id)
                              setFerramentaOpen(false)
                              setQuantidade(1)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                ferramentaId === f.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{f.codigo} - {f.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                Disponível: {f.quantidade_disponivel}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Colaborador */}
            <div className="space-y-2">
              <Label>Colaborador *</Label>
              <Popover open={colaboradorOpen} onOpenChange={setColaboradorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={colaboradorOpen}
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    {selectedColaborador ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedColaborador.nome}
                      </span>
                    ) : (
                      'Selecione um colaborador...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar colaborador..." />
                    <CommandList>
                      <CommandEmpty>Nenhum colaborador encontrado</CommandEmpty>
                      <CommandGroup>
                        {colaboradores.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.nome} ${c.cpf}`}
                            onSelect={() => {
                              setColaboradorId(c.id)
                              setColaboradorOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                colaboradorId === c.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{c.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.cargo} - {c.setor} | CPF: {formatCPF(c.cpf)}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max={selectedFerramenta?.quantidade_disponivel || 1}
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
              {selectedFerramenta && (
                <p className="text-xs text-muted-foreground">
                  Disponível: {selectedFerramenta.quantidade_disponivel}
                </p>
              )}
            </div>

            {/* Data Prevista */}
            <div className="space-y-2">
              <Label htmlFor="dataPrevista">Data Prevista de Devolução</Label>
              <Input
                id="dataPrevista"
                type="date"
                value={dataPrevista}
                onChange={(e) => setDataPrevista(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo/Finalidade</Label>
              <Input
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Manutenção preventiva"
                disabled={isLoading}
              />
            </div>

            {/* Local de Uso */}
            <div className="space-y-2">
              <Label htmlFor="localUso">Local de Uso</Label>
              <Input
                id="localUso"
                value={localUso}
                onChange={(e) => setLocalUso(e.target.value)}
                placeholder="Ex: Obra Centro, Setor A"
                disabled={isLoading}
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais..."
                disabled={isLoading}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Foto */}
        <Card>
          <CardHeader>
            <CardTitle>Registro Fotográfico</CardTitle>
            <CardDescription>
              Tire uma foto da ferramenta no momento da retirada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              value={fotoUrl}
              onChange={setFotoUrl}
              folder="retiradas"
              label="Foto da Ferramenta"
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <Button type="button" variant="outline" asChild disabled={isLoading}>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={isLoading || !ferramentaId || !colaboradorId}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Registrar Retirada
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
