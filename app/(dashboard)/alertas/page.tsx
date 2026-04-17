import { createClient } from '@/lib/supabase/server'
import { AlertasList } from './alertas-list'

export const metadata = {
  title: 'Alertas',
}

export default async function AlertasPage() {
  const supabase = await createClient()

  const { data: alertas } = await supabase
    .from('alertas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
        <p className="text-muted-foreground">
          Notificações e alertas do sistema
        </p>
      </div>

      <AlertasList initialAlertas={alertas ?? []} />
    </div>
  )
}
