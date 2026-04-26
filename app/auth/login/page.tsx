'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoLight } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Wrench, Package, Users, Shield } from 'lucide-react'
import Image from 'next/image'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos' 
        : 'Erro ao fazer login. Tente novamente.')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
  <Image
    src="/logo-eagle.jpg"
    alt="Eagle Soluções"
    width={56}
    height={56}
    className="rounded-xl object-contain"
    priority
  />
</div>
          <p className="text-white/80 text-lg max-w-md">
            Sistema de Controle de Ferramentas e Patrimônio
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Gestão completa do seu patrimônio em um só lugar
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-white/20">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ferramentas</h3>
                <p className="text-sm text-white/70">Controle total do inventário</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-white/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Colaboradores</h3>
                <p className="text-sm text-white/70">Gestão de responsáveis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-white/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Movimentações</h3>
                <p className="text-sm text-white/70">Retiradas e devoluções</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Termos Digitais</h3>
                <p className="text-sm text-white/70">Assinatura eletrônica</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
           EAGLE SOLUÇÕES. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8">
  <Image
    src="/logo-eagle.jpg"
    alt="Eagle Soluções"
    width={56}
    height={56}
    className="rounded-xl object-contain"
    priority
  />
</div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground lg:hidden">
            © 2024 EAGLE SOLUÇÕES. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
