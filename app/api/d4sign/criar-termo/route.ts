import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const D4SIGN_BASE = 'https://sandbox.d4sign.com.br/api/v1'
const TOKEN = process.env.D4SIGN_TOKEN_API!
const CRYPT_KEY = process.env.D4SIGN_CRYPT_KEY!
const SAFE_ID = process.env.D4SIGN_SAFE_ID!

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { movimentacaoId } = body

    // Busca dados completos da movimentação
    const { data: mov, error: movError } = await supabase
      .from('movimentacoes')
      .select(`
        *,
        ferramenta:ferramentas(nome, codigo, marca, modelo),
        colaborador:colaboradores(nome, cpf, cargo, setor, email)
      `)
      .eq('id', movimentacaoId)
      .single()

    if (movError || !mov) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
    }

    const colaborador = mov.colaborador as any
    const ferramenta = mov.ferramenta as any

    if (!colaborador?.email) {
      return NextResponse.json({ error: 'Colaborador sem email cadastrado' }, { status: 400 })
    }

    // Gera HTML do termo
    const dataRetirada = new Date(mov.data_movimentacao).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    const dataPrevista = mov.data_prevista_devolucao
      ? new Date(mov.data_prevista_devolucao).toLocaleDateString('pt-BR')
      : 'Não definida'
    const cpfFormatado = colaborador.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

    const htmlTermo = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #000; margin: 40px; }
  h1 { text-align: center; font-size: 18px; margin-bottom: 8px; }
  h2 { text-align: center; font-size: 14px; font-weight: normal; margin-bottom: 32px; color: #444; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  table td { padding: 8px 12px; border: 1px solid #ccc; }
  table td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
  .section { margin-bottom: 24px; }
  .section-title { font-weight: bold; font-size: 13px; text-transform: uppercase;
    border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
  .clausula { margin-bottom: 12px; line-height: 1.6; }
  .clausula strong { display: block; margin-bottom: 4px; }
  .foto { margin: 24px 0; text-align: center; }
  .foto img { max-width: 400px; border: 1px solid #ccc; border-radius: 4px; }
  .foto p { font-size: 12px; color: #666; margin-top: 4px; }
  .assinatura { margin-top: 60px; text-align: center; }
  .assinatura-linha { border-top: 1px solid #000; width: 300px; margin: 0 auto 8px; }
</style>
</head>
<body>

<h1>EAGLE SOLUÇÕES</h1>
<h2>TERMO DE RESPONSABILIDADE DE RETIRADA DE FERRAMENTA</h2>

<div class="section">
  <div class="section-title">Dados do Colaborador</div>
  <table>
    <tr><td>Nome</td><td>${colaborador.nome}</td></tr>
    <tr><td>CPF</td><td>${cpfFormatado}</td></tr>
    <tr><td>Cargo</td><td>${colaborador.cargo}</td></tr>
    <tr><td>Setor</td><td>${colaborador.setor}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Dados da Ferramenta</div>
  <table>
    <tr><td>Nome</td><td>${ferramenta.nome}</td></tr>
    <tr><td>Código</td><td>${ferramenta.codigo}</td></tr>
    <tr><td>Marca</td><td>${ferramenta.marca || '—'}</td></tr>
    <tr><td>Modelo</td><td>${ferramenta.modelo || '—'}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Dados da Retirada</div>
  <table>
    <tr><td>Data da Retirada</td><td>${dataRetirada}</td></tr>
    <tr><td>Data Prevista de Devolução</td><td>${dataPrevista}</td></tr>
    <tr><td>Motivo / Finalidade</td><td>${mov.motivo || '—'}</td></tr>
    <tr><td>Local de Uso</td><td>${mov.local_uso || '—'}</td></tr>
    <tr><td>Quantidade</td><td>${mov.quantidade}</td></tr>
    ${mov.observacoes ? `<tr><td>Observações</td><td>${mov.observacoes}</td></tr>` : ''}
  </table>
</div>

${mov.foto_retirada_url ? `
<div class="foto">
  <div class="section-title" style="text-align:left">Foto de Evidência</div>
  <img src="${mov.foto_retirada_url}" alt="Foto da ferramenta na retirada" />
  <p>Registro fotográfico realizado no momento da retirada</p>
</div>
` : ''}

<div class="section">
  <div class="section-title">Termos e Condições</div>
  <div class="clausula">
    <strong>Cláusula 1ª – Da Responsabilidade</strong>
    Eu, ${colaborador.nome}, declaro estar recebendo a ferramenta descrita acima em 
    boas condições de uso e me comprometo a zelar pela sua conservação, utilizando-a exclusivamente 
    para fins profissionais autorizados pela empresa EAGLE SOLUÇÕES.
  </div>
  <div class="clausula">
    <strong>Cláusula 2ª – Da Devolução</strong>
    Comprometo-me a devolver a ferramenta até a data prevista indicada neste termo, nas mesmas 
    condições em que a recebi. Em caso de impossibilidade, comunicarei com antecedência ao 
    responsável pelo almoxarifado.
  </div>
  <div class="clausula">
    <strong>Cláusula 3ª – De Danos e Perdas</strong>
    Em caso de dano, perda ou extravio causado por mau uso ou negligência, assumo a responsabilidade 
    pelo ressarcimento do valor correspondente ao bem, conforme avaliação da empresa.
  </div>
  <div class="clausula">
    <strong>Cláusula 4ª – Da Ciência</strong>
    Declaro ter lido e compreendido todas as cláusulas deste termo, concordando com seus termos 
    ao assinar eletronicamente este documento.
  </div>
</div>

<div class="assinatura">
  <div class="assinatura-linha"></div>
  <p>${colaborador.nome}</p>
  <p>CPF: ${cpfFormatado}</p>
  <p>${colaborador.cargo} — ${colaborador.setor}</p>
</div>

</body>
</html>
`

    // 1. Gera PDF a partir do HTML com Puppeteer
const puppeteer = require('puppeteer')
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setContent(htmlTermo, { waitUntil: 'networkidle0' })
const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
await browser.close()

    // 2. Faz upload do PDF para o D4Sign
    const formData = new FormData()
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
    formData.append('file', pdfBlob, `termo-retirada-${movimentacaoId}.pdf`)
    formData.append('uuid_safe', SAFE_ID)

    const uploadRes = await fetch(
      `${D4SIGN_BASE}/documents/${SAFE_ID}/upload?tokenAPI=${TOKEN}&cryptKey=${CRYPT_KEY}`,
      { method: 'POST', body: formData }
    )

    const uploadData = await uploadRes.json()
    console.log('D4Sign upload status:', uploadRes.status)
    console.log('D4Sign upload response:', JSON.stringify(uploadData, null, 2))

    if (!uploadRes.ok || !uploadData.uuid) {
      console.error('D4Sign upload error:', uploadData)
      return NextResponse.json({ error: 'Erro ao enviar documento para D4Sign', detail: uploadData }, { status: 500 })
    }

    const documentUuid = uploadData.uuid

    // 3. Adiciona signatário
const signatarioRes = await fetch(
  `${D4SIGN_BASE}/documents/${documentUuid}/createlist?tokenAPI=${TOKEN}&cryptKey=${CRYPT_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signers: [
        {
          email: colaborador.email,
          act: '1',
          foreign: '0',
          certificadoicpbr: '0',
          assinatura_presencial: '0',
          docauth: '0',
          docauthandselfie: '0',
          embed_methodauth: 'email',
          embed_smsnumber: '',
        }
      ]
    })
  }
)

const signatarioData = await signatarioRes.json()
console.log('D4Sign signatario response:', JSON.stringify(signatarioData, null, 2))

if (!signatarioRes.ok) {
  console.error('D4Sign signatario error:', signatarioData)
  return NextResponse.json({ error: 'Erro ao adicionar signatário', detail: signatarioData }, { status: 500 })
}

// Aguarda 2s para o D4Sign processar o signatário
await new Promise(resolve => setTimeout(resolve, 2000))

// 4. Envia para assinatura

const sendRes = await fetch(
  `${D4SIGN_BASE}/documents/${documentUuid}/sendtosign?tokenAPI=${TOKEN}&cryptKey=${CRYPT_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Por favor, assine o termo de responsabilidade de retirada de ferramenta.',
      skip_email: '0',
      workflow: '0',
    })
  }
)

const sendText = await sendRes.text()
console.log('D4Sign send status:', sendRes.status)
console.log('D4Sign send response:', sendText)

let sendData: any = {}
try {
  sendData = sendText ? JSON.parse(sendText) : {}
} catch {
  sendData = { raw: sendText }
}

if (!sendRes.ok) {
  console.error('D4Sign send error:', sendData)
  return NextResponse.json({ error: 'Erro ao enviar para assinatura', detail: sendData }, { status: 500 })
}
    // 5. Salva o termo no banco
    await supabase.from('termos_responsabilidade').insert({
      movimentacao_id: movimentacaoId,
      colaborador_id: mov.colaborador_id,
      conteudo_termo: htmlTermo,
      d4sign_document_key: documentUuid,
      d4sign_status: 'enviado',
    })

    return NextResponse.json({ success: true, documentUuid })

  } catch (error) {
    console.error('Erro D4Sign:', error)
    return NextResponse.json({ error: 'Erro interno', detail: String(error) }, { status: 500 })
  }
}