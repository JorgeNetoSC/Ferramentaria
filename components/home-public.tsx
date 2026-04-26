'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Wrench, LogIn, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const CODIGO_ACESSO = '86246218'

export default function HomePublic() {
  const [showInput, setShowInput] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [showCodigo, setShowCodigo] = useState(false)
  const router = useRouter()

  const handleAcessar = () => {
    if (codigo === CODIGO_ACESSO) {
      router.push('/ferramentas-publico')
    } else {
      toast.error('Código inválido')
      setCodigo('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Wrench className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Eagle Soluções</h1>
        </div>
        <p className="text-muted-foreground text-lg">Controle de Ferramentas</p>
      </div>

      <div className="grid gap-4 w-full max-w-sm">
        {!showInput ? (
          <>
            <Button
              size="lg"
              className="h-14 text-base"
              onClick={() => setShowInput(true)}
            >
              <Eye className="mr-2 h-5 w-5" />
              Ver Ferramentas Disponíveis
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              onClick={() => router.push('/auth/login')}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Entrar no Sistema
            </Button>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Código de Acesso</CardTitle>
              <CardDescription>Digite o código de 8 dígitos para visualizar as ferramentas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  type={showCodigo ? 'text' : 'password'}
                  placeholder="••••••••"
                  maxLength={8}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAcessar()}
                  className="pr-10 text-center text-xl tracking-widest"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCodigo(!showCodigo)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCodigo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button className="w-full" onClick={handleAcessar} disabled={codigo.length !== 8}>
                Acessar
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setShowInput(false); setCodigo('') }}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}