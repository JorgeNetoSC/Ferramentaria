import { CatalogoForm } from '../catalogo-form'

export const metadata = { title: 'Novo Item no Catálogo' }

export default function NovoCatalogoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Item</h1>
        <p className="text-muted-foreground">Adicione um novo item ao catálogo</p>
      </div>
      <CatalogoForm mode="create" />
    </div>
  )
}