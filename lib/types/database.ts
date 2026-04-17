// EAGLE SOLUÇÕES - Database Types

export type EstadoConservacao = 'novo' | 'bom' | 'regular' | 'ruim' | 'em_manutencao'
export type TipoMovimentacao = 'retirada' | 'devolucao'
export type StatusMovimentacao = 'pendente' | 'concluido' | 'atrasado' | 'cancelado'
export type StatusD4Sign = 'pendente' | 'enviado' | 'assinado' | 'recusado' | 'expirado'
export type TipoAlerta = 'atraso_devolucao' | 'estoque_baixo' | 'manutencao' | 'termo_pendente'
export type PapelUsuario = 'admin' | 'gerente' | 'operador'

export interface Colaborador {
  id: string
  nome: string
  cpf: string
  cargo: string
  setor: string
  telefone: string | null
  email: string | null
  data_admissao: string
  ativo: boolean
  foto_url: string | null
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nome: string
  descricao: string | null
  created_at: string
}

export interface Ferramenta {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  categoria_id: string | null
  marca: string | null
  modelo: string | null
  numero_serie: string | null
  valor_unitario: number | null
  quantidade_total: number
  quantidade_disponivel: number
  localizacao: string | null
  estado_conservacao: EstadoConservacao | null
  data_aquisicao: string | null
  foto_url: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  // Joined fields
  categoria?: Categoria
}

export interface Movimentacao {
  id: string
  tipo: TipoMovimentacao
  ferramenta_id: string
  colaborador_id: string
  quantidade: number
  data_movimentacao: string
  data_prevista_devolucao: string | null
  data_devolucao_efetiva: string | null
  observacoes: string | null
  motivo: string | null
  local_uso: string | null
  foto_retirada_url: string | null
  foto_devolucao_url: string | null
  assinatura_digital_url: string | null
  status: StatusMovimentacao
  movimentacao_origem_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  ferramenta?: Ferramenta
  colaborador?: Colaborador
}

export interface TermoResponsabilidade {
  id: string
  movimentacao_id: string
  colaborador_id: string
  conteudo_termo: string
  assinatura_url: string | null
  d4sign_document_key: string | null
  d4sign_status: StatusD4Sign
  d4sign_signed_at: string | null
  created_at: string
  // Joined fields
  movimentacao?: Movimentacao
  colaborador?: Colaborador
}

export interface Alerta {
  id: string
  tipo: TipoAlerta
  titulo: string
  mensagem: string
  referencia_id: string | null
  referencia_tipo: string | null
  lido: boolean
  created_at: string
}

export interface Configuracao {
  id: string
  chave: string
  valor: string
  descricao: string | null
  updated_at: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: PapelUsuario
  ativo: boolean
  created_at: string
  updated_at: string
}

// Dashboard Stats
export interface DashboardStats {
  totalFerramentas: number
  ferramentasDisponiveis: number
  ferramentasEmUso: number
  ferramentasManutencao: number
  totalColaboradores: number
  colaboradoresAtivos: number
  retiradasHoje: number
  devolucoesHoje: number
  alertasPendentes: number
  retiradasAtrasadas: number
}

// Form types
export interface ColaboradorFormData {
  nome: string
  cpf: string
  cargo: string
  setor: string
  telefone?: string
  email?: string
  data_admissao: string
  foto_url?: string
}

export interface FerramentaFormData {
  codigo: string
  nome: string
  descricao?: string
  categoria_id?: string
  marca?: string
  modelo?: string
  numero_serie?: string
  valor_unitario?: number
  quantidade_total: number
  localizacao?: string
  estado_conservacao?: EstadoConservacao
  data_aquisicao?: string
  foto_url?: string
}

export interface MovimentacaoFormData {
  tipo: TipoMovimentacao
  ferramenta_id: string
  colaborador_id: string
  quantidade: number
  data_prevista_devolucao?: string
  observacoes?: string
  motivo?: string
  local_uso?: string
  foto_retirada_url?: string
}

export interface DevolucaoFormData {
  movimentacao_id: string
  observacoes?: string
  foto_devolucao_url?: string
}
