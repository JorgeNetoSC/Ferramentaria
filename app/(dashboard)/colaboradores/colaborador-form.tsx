'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Colaborador, ColaboradorFormData } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface ColaboradorFormProps {
  colaborador?: Colaborador
  mode: 'create' | 'edit'
}

export function ColaboradorForm({ colaborador, mode }: ColaboradorFormProps) {
  const [formData, setFormData] = useState<ColaboradorFormData>({
    nome: colaborador?.nome ?? '',
    cpf: colaborador?.cpf ?? '',
    cargo: colaborador?.cargo ?? '',
    setor: colaborador?.setor ?? '',
    telefone: colaborador?.telefone ?? '',
    email: colaborador?.email ?? '',
    data_admissao: colaborador?.data_admissao ?? new Date().toISOString().split('T')[0],
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 11)
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 11)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, telefone: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const payload = {
      ...formData,
      telefone: formData.telefone || null,
      email: formData.email || null,
    }

    if (mode === 'create') {
      const { error } = await supabase.from('colaboradores').insert(payload)

      if (error) {
        if (error.code === '23505') {
          toast.error('CPF já cadastrado')
        } else {
          toast.error('Erro ao criar colaborador')
          console.error(error)
        }
        setIsLoading(false)
        return
      }

      toast.success('Colaborador criado com sucesso')
    } else {
      const { error } = await supabase
        .from('colaboradores')
        .update(payload)
        .eq('id', colaborador!.id)

      if (error) {
        toast.error('Erro ao atualizar colaborador')
        console.error(error)
        setIsLoading(false)
        return
      }

      toast.success('Colaborador atualizado com sucesso')
    }

    router.push('/colaboradores')
    router.refresh()
  }

  const displayCPF = (cpf: string) => {
    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const displayPhone = (phone: string) => {
    if (!phone) return ''
    if (phone.length <= 2) return `(${phone}`
    if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Novo Colaborador' : 'Editar Colaborador'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo do colaborador"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                name="cpf"
                value={displayCPF(formData.cpf)}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
                disabled={isLoading || mode === 'edit'}
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Ex: Técnico, Eletricista"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor *</Label>
              <Input
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                placeholder="Ex: Manutenção, Operações"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={displayPhone(formData.telefone ?? '')}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email ?? ''}
                onChange={handleChange}
                placeholder="colaborador@empresa.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_admissao">Data de Admissão *</Label>
              <Input
                id="data_admissao"
                name="data_admissao"
                type="date"
                value={formData.data_admissao}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" asChild disabled={isLoading}>
              <Link href="/colaboradores">
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
                  {mode === 'create' ? 'Criar Colaborador' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
