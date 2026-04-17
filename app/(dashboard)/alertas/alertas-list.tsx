'use client'

import { useState } from 'react'
import type { Alerta } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Package, FileText, Bell, Check, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AlertasListProps {
  initialAlertas: Alerta[]
}

const tipoConfig: Record<string, { icon: typeof AlertTriangle; label: string; color: string }> = {
  atraso_devolucao: { icon: Clock, label: 'Atraso de Devolução', color: 'text-destructive bg-destructive/10' },
  estoque_baixo: { icon: Package, label: 'Estoque Baixo', color: 'text-warning bg-warning/10' },
  manutencao: { icon: AlertTriangle, label: 'Manutenção', color: 'text-muted-foreground bg-muted' },
  termo_pendente: { icon: FileText, label: 'Termo Pendente', color: 'text-primary bg-primary/10' },
}

export function AlertasList({ initialAlertas }: AlertasListProps) {
  const [alertas, setAlertas] = useState(initialAlertas)
  const supabase = createClient()

  const pendentes = alertas.filter(a => !a.lido)
  const lidos = alertas.filter(a => a.lido)

  const marcarComoLido = async (id: string) => {
    const { error } = await supabase
      .from('alertas')
      .update({ lido: true })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao marcar como lido')
      return
    }

    setAlertas(alertas.map(a => a.id === id ? { ...a, lido: true } : a))
    toast.success('Alerta marcado como lido')
  }

  const marcarTodosComoLidos = async () => {
    const { error } = await supabase
      .from('alertas')
      .update({ lido: true })
      .eq('lido', false)

    if (error) {
      toast.error('Erro ao marcar todos como lidos')
      return
    }

    setAlertas(alertas.map(a => ({ ...a, lido: true })))
    toast.success('Todos os alertas foram marcados como lidos')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const AlertCard = ({ alerta }: { alerta: Alerta }) => {
    const config = tipoConfig[alerta.tipo] || tipoConfig.manutencao
    const Icon = config.icon

    return (
      <div
        className={cn(
          'p-4 rounded-lg border transition-colors',
          alerta.lido ? 'bg-muted/30 border-border' : 'bg-card border-border hover:bg-muted/50'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-lg', config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn('font-medium', alerta.lido && 'text-muted-foreground')}>
                  {alerta.titulo}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {alerta.mensagem}
                </p>
              </div>
              {!alerta.lido && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => marcarComoLido(alerta.id)}
                  className="shrink-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(alerta.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas Pendentes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Pendentes</h2>
              {pendentes.length > 0 && (
                <Badge variant="destructive">{pendentes.length}</Badge>
              )}
            </div>
            {pendentes.length > 0 && (
              <Button variant="outline" size="sm" onClick={marcarTodosComoLidos}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Marcar todos como lidos
              </Button>
            )}
          </div>

          {pendentes.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhum alerta pendente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendentes.map((alerta) => (
                <AlertCard key={alerta.id} alerta={alerta} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas Lidos */}
      {lidos.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
              Histórico ({lidos.length})
            </h2>
            <div className="space-y-3">
              {lidos.slice(0, 20).map((alerta) => (
                <AlertCard key={alerta.id} alerta={alerta} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
