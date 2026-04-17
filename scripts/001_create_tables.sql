-- EAGLE SOLUÇÕES - Sistema de Controle de Ferramentas
-- Migration Script: Create all tables

-- Tabela de Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  cargo TEXT NOT NULL,
  setor TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Categorias de Ferramentas
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Ferramentas
CREATE TABLE IF NOT EXISTS ferramentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias(id),
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  valor_unitario DECIMAL(10,2),
  quantidade_total INTEGER NOT NULL DEFAULT 1,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 1,
  localizacao TEXT,
  estado_conservacao TEXT CHECK (estado_conservacao IN ('novo', 'bom', 'regular', 'ruim', 'em_manutencao')),
  data_aquisicao DATE,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Movimentações (Retiradas e Devoluções)
CREATE TABLE IF NOT EXISTS movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('retirada', 'devolucao')),
  ferramenta_id UUID NOT NULL REFERENCES ferramentas(id),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  data_prevista_devolucao DATE,
  data_devolucao_efetiva TIMESTAMPTZ,
  observacoes TEXT,
  motivo TEXT,
  local_uso TEXT,
  foto_retirada_url TEXT,
  foto_devolucao_url TEXT,
  assinatura_digital_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'atrasado', 'cancelado')),
  movimentacao_origem_id UUID REFERENCES movimentacoes(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Termos de Responsabilidade
CREATE TABLE IF NOT EXISTS termos_responsabilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimentacao_id UUID NOT NULL REFERENCES movimentacoes(id),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  conteudo_termo TEXT NOT NULL,
  assinatura_url TEXT,
  d4sign_document_key TEXT,
  d4sign_status TEXT DEFAULT 'pendente' CHECK (d4sign_status IN ('pendente', 'enviado', 'assinado', 'recusado', 'expirado')),
  d4sign_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Alertas
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('atraso_devolucao', 'estoque_baixo', 'manutencao', 'termo_pendente')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  referencia_id UUID,
  referencia_tipo TEXT,
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Usuários do Sistema (ligada ao auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT 'operador' CHECK (papel IN ('admin', 'gerente', 'operador')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ferramentas_codigo ON ferramentas(codigo);
CREATE INDEX IF NOT EXISTS idx_ferramentas_categoria ON ferramentas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_ativo ON ferramentas(ativo);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON colaboradores(cpf);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON colaboradores(ativo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_status ON movimentacoes(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_ferramenta ON movimentacoes(ferramenta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_colaborador ON movimentacoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);

-- Enable Row Level Security
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE termos_responsabilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso a usuários autenticados
CREATE POLICY "Authenticated users can view colaboradores" ON colaboradores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert colaboradores" ON colaboradores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update colaboradores" ON colaboradores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete colaboradores" ON colaboradores FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view categorias" ON categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert categorias" ON categorias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categorias" ON categorias FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categorias" ON categorias FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view ferramentas" ON ferramentas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ferramentas" ON ferramentas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ferramentas" ON ferramentas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ferramentas" ON ferramentas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view movimentacoes" ON movimentacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert movimentacoes" ON movimentacoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movimentacoes" ON movimentacoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete movimentacoes" ON movimentacoes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view termos" ON termos_responsabilidade FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert termos" ON termos_responsabilidade FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update termos" ON termos_responsabilidade FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view alertas" ON alertas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alertas" ON alertas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alertas" ON alertas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view configuracoes" ON configuracoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage configuracoes" ON configuracoes FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view own profile" ON usuarios FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON usuarios FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ferramentas_updated_at BEFORE UPDATE ON ferramentas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimentacoes_updated_at BEFORE UPDATE ON movimentacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categorias (nome, descricao) VALUES
  ('Ferramentas Manuais', 'Martelos, chaves, alicates e outras ferramentas manuais'),
  ('Ferramentas Elétricas', 'Furadeiras, serras, lixadeiras e outras ferramentas elétricas'),
  ('Equipamentos de Medição', 'Trenas, níveis, multímetros e equipamentos de medição'),
  ('Equipamentos de Segurança', 'EPIs e equipamentos de proteção'),
  ('Escadas e Andaimes', 'Escadas, andaimes e plataformas de trabalho'),
  ('Outros', 'Outras ferramentas e equipamentos')
ON CONFLICT (nome) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('dias_alerta_devolucao', '2', 'Dias antes do vencimento para alertar sobre devolução'),
  ('estoque_minimo_alerta', '2', 'Quantidade mínima para gerar alerta de estoque baixo'),
  ('requer_foto_retirada', 'true', 'Exigir foto no momento da retirada'),
  ('requer_foto_devolucao', 'true', 'Exigir foto no momento da devolução'),
  ('requer_assinatura_digital', 'true', 'Exigir assinatura digital nos termos'),
  ('d4sign_ativo', 'false', 'Integração D4Sign ativa')
ON CONFLICT (chave) DO NOTHING;
