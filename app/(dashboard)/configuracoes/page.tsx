'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Settings, Bell, Camera, FileSignature, Save, ExternalLink } from 'lucide-react'

interface Configuracao {
  id: string
  chave: string
  valor: string
  descricao: string | null
}

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')

    if (error) {
      toast.error('Erro ao carregar configurações')
      console.error(error)
    } else if (data) {
      const configMap: Record<string, string> = {}
      data.forEach((c: Configuracao) => {
        configMap[c.chave] = c.valor
      })
      setConfigs(configMap)
    }
    setIsLoading(false)
  }

  const handleChange = (chave: string, valor: string) => {
    setConfigs(prev => ({ ...prev, [chave]: valor }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      for (const [chave, valor] of Object.entries(configs)) {
        const { error } = await supabase
          .from('configuracoes')
          .update({ valor })
          .eq('chave', chave)

        if (error) throw error
      }

      toast.success('Configurações salvas com sucesso')
    } catch (error) {
      toast.error('Erro ao salvar configurações')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as preferências do sistema
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas
            </CardTitle>
            <CardDescription>
              Configure os parâmetros de alertas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dias_alerta">Dias para Alerta de Devolução</Label>
                <Input
                  id="dias_alerta"
                  type="number"
                  min="1"
                  value={configs.dias_alerta_devolucao || '2'}
                  onChange={(e) => handleChange('dias_alerta_devolucao', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Quantos dias antes do vencimento para alertar sobre devolução
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo para Alerta</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  min="1"
                  value={configs.estoque_minimo_alerta || '2'}
                  onChange={(e) => handleChange('estoque_minimo_alerta', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Quantidade mínima para gerar alerta de estoque baixo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registro Fotográfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Registro Fotográfico
            </CardTitle>
            <CardDescription>
              Configure as exigências de fotos nas movimentações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Foto na Retirada</Label>
                <p className="text-xs text-muted-foreground">
                  Obrigar registro fotográfico ao retirar ferramenta
                </p>
              </div>
              <Switch
                checked={configs.requer_foto_retirada === 'true'}
                onCheckedChange={(checked) => handleChange('requer_foto_retirada', checked.toString())}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Foto na Devolução</Label>
                <p className="text-xs text-muted-foreground">
                  Obrigar registro fotográfico ao devolver ferramenta
                </p>
              </div>
              <Switch
                checked={configs.requer_foto_devolucao === 'true'}
                onCheckedChange={(checked) => handleChange('requer_foto_devolucao', checked.toString())}
              />
            </div>
          </CardContent>
        </Card>

        {/* D4Sign */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Assinatura Digital (D4Sign)
            </CardTitle>
            <CardDescription>
              Configure a integração com D4Sign para assinatura eletrônica de termos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integração D4Sign Ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Ativar assinatura eletrônica dos termos de responsabilidade
                </p>
              </div>
              <Switch
                checked={configs.d4sign_ativo === 'true'}
                onCheckedChange={(checked) => handleChange('d4sign_ativo', checked.toString())}
              />
            </div>

            {configs.d4sign_ativo === 'true' && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    Para configurar a integração D4Sign, você precisa adicionar as variáveis de ambiente:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>D4SIGN_TOKEN_API</li>
                    <li>D4SIGN_CRYPT_KEY</li>
                    <li>D4SIGN_SAFE_ID</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href="https://www.d4sign.com.br" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Acessar D4Sign
                    </a>
                  </Button>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir Assinatura Digital</Label>
                <p className="text-xs text-muted-foreground">
                  Obrigar assinatura digital nos termos de responsabilidade
                </p>
              </div>
              <Switch
                checked={configs.requer_assinatura_digital === 'true'}
                onCheckedChange={(checked) => handleChange('requer_assinatura_digital', checked.toString())}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Informações do sistema EAGLE SOLUÇÕES
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Versão</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Ambiente</p>
                <p className="font-medium">Produção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
