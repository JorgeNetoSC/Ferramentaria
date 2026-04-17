import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get alert count
  const { count: alertCount } = await supabase
    .from('alertas')
    .select('*', { count: 'exact', head: true })
    .eq('lido', false)

  // Get user name from metadata or email
  const userName = user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário'

  return (
    <SidebarProvider>
      <AppSidebar alertCount={alertCount ?? 0} userName={userName} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <div className="flex-1 flex items-center gap-4">
            <div className="relative max-w-md flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ferramentas, colaboradores..."
                className="pl-10 bg-secondary border-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/alertas">
                <Bell className="h-5 w-5" />
                {(alertCount ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
                <span className="sr-only">Alertas</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
