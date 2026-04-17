import Link from 'next/link'
import { LogoLight } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center mb-8">
          <LogoLight size="lg" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Conta Criada!</CardTitle>
            <CardDescription>
              Sua solicitação foi enviada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Verifique seu e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              <p>Após confirmar seu e-mail, um administrador precisará aprovar seu acesso ao sistema.</p>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para login
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2024 EAGLE SOLUÇÕES. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
