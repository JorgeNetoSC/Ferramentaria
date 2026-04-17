'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  ArrowUpFromLine,
  ArrowDownToLine,
  FileText,
  History,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Colaboradores',
    href: '/colaboradores',
    icon: Users,
  },
  {
    title: 'Ferramentas',
    href: '/ferramentas',
    icon: Wrench,
  },
  {
    title: 'Estoque',
    href: '/estoque',
    icon: Package,
  },
]

const operacoesNavItems = [
  {
    title: 'Nova Retirada',
    href: '/retirada',
    icon: ArrowUpFromLine,
  },
  {
    title: 'Nova Devolução',
    href: '/devolucao',
    icon: ArrowDownToLine,
  },
]

const relatoriosNavItems = [
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: FileText,
  },
  {
    title: 'Histórico',
    href: '/historico',
    icon: History,
  },
]

interface AppSidebarProps {
  alertCount?: number
  userName?: string
}

export function AppSidebar({ alertCount = 0, userName = 'Usuário' }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Erro ao sair')
      return
    }
    toast.success('Sessão encerrada')
    router.push('/auth/login')
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                    className={cn(
                      'transition-colors',
                      (pathname === item.href || pathname.startsWith(item.href + '/')) &&
                        'bg-sidebar-accent text-sidebar-primary font-medium'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider">
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operacoesNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'transition-colors',
                      pathname === item.href && 'bg-sidebar-accent text-sidebar-primary font-medium'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider">
            Relatórios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {relatoriosNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      'transition-colors',
                      pathname === item.href && 'bg-sidebar-accent text-sidebar-primary font-medium'
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wider">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/alertas'}
                  className={cn(
                    'transition-colors',
                    pathname === '/alertas' && 'bg-sidebar-accent text-sidebar-primary font-medium'
                  )}
                >
                  <Link href="/alertas" className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>Alertas</span>
                    </span>
                    {alertCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
                        {alertCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/configuracoes'}
                  className={cn(
                    'transition-colors',
                    pathname === '/configuracoes' && 'bg-sidebar-accent text-sidebar-primary font-medium'
                  )}
                >
                  <Link href="/configuracoes">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-primary">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/60">Operador</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
