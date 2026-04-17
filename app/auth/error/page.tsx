import Link from 'next/link'
import { LogoLight } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center mb-8">
          <LogoLight size="lg" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Erro de Autenticação</CardTitle>
            <CardDescription>
              Ocorreu um erro durante o processo de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground text-center">
              <p>O link pode ter expirado ou já foi utilizado. Por favor, tente fazer login novamente ou solicite um novo link.</p>
            </div>

            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/auth/login">
                  Ir para Login
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2024 EAGLE SOLUÇÕES. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
