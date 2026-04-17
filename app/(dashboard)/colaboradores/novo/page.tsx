import { ColaboradorForm } from '../colaborador-form'

export const metadata = {
  title: 'Novo Colaborador',
}

export default function NovoColaboradorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Colaborador</h1>
        <p className="text-muted-foreground">
          Cadastre um novo colaborador no sistema
        </p>
      </div>

      <ColaboradorForm mode="create" />
    </div>
  )
}
