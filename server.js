const fastify = require('fastify')({ logger: true })

const API_URL =
  'https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws/'


// Endpoint para consultar filmes
fastify.get('/filmes', async (request, reply) => {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      return reply.code(502).send({
        erro: 'Não foi possível consultar a API de filmes'
      })
    }

    const dados = await response.json()
    const filmes = extrairFilmes(dados)

    if (!Array.isArray(filmes)) {
      return reply.code(502).send({
        erro: 'A API externa não retornou uma lista de filmes válida',
        recebido: typeof dados
      })
    }

    return filmes.map(normalizarFilme)
  } catch (error) {
    request.log.error(error)

    return reply.code(500).send({ erro: 'Erro ao processar os filmes' })
  }
})


// Funções auxiliares
function extrairFilmes(dados) {
  if (Array.isArray(dados)) return dados
  if (!dados || typeof dados !== 'object') return []

  return dados.filmes ?? dados.results ?? dados.data ?? []
}

function normalizarFilme(filme) {
  const orcamento = parseValor(filme.orcamento)
  const bilheteria = parseValor(filme.bilheteria)
  const lucro = bilheteria - orcamento

  const maiorPremio = filme.premios?.reduce((maior, premio) => {
    if (!maior || premio.relevancia > maior.relevancia) {
      return premio
    }

    return maior
  }, null)

  const imdb = filme.ratings?.find((rating) => rating.fonte === 'IMDb')
  const sinopse = obterSinopse(filme.sinopse)

  return {
    titulo: filme.titulo,
    ano: filme.ano,
    diretor: filme.diretor,
    genero: filme.genero,
    duracaoSegundos: (Number(filme.duracao) || 0) * 60,
    notaIMDb: String(imdb?.valor ?? ''),
    lucro: formatarValor(lucro),
    maiorPremiacao: maiorPremio?.nome ?? '',
    sinopse: sinopse?.texto ?? ''
  }
}

function obterSinopse(sinopses = []) {
  return (
    sinopses.find((s) => s.idioma === 'pt-br') ||
    sinopses.find((s) => s.idioma === 'en') ||
    sinopses[0] ||
    null
  )
}

function parseValor(valor) {
  if (!valor) return 0

  const texto = String(valor).trim().toLowerCase().replace(/\$/g, '')
  const numero = Number.parseFloat(texto.replace(',', '.').replace(/[^\d.]/g, ''))

  if (Number.isNaN(numero)) return 0

  if (texto.includes('bilhão') || texto.includes('bilhões')) {
    return numero * 1_000_000_000
  }

  if (texto.includes('milhão') || texto.includes('milhões')) {
    return numero * 1_000_000
  }

  if (texto.includes('mil')) {
    return numero * 1_000
  }

  return numero
}

function formatarValor(valor) {
  const absoluto = Math.abs(valor)

  if (absoluto >= 1_000_000_000) {
    return `$${formatarNumero(valor / 1_000_000_000)} bilhões`
  }

  if (absoluto >= 1_000_000) {
    return `$${formatarNumero(valor / 1_000_000)} milhões`
  }

  return `$${valor.toLocaleString('pt-BR')}`
}

function formatarNumero(numero) {
  return Number(numero)
    .toFixed(1)
    .replace('.0', '')
    .replace('.', ',')
}


// Iniciar o servidor
const iniciarServidor = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Servidor rodando em http://localhost:3000')
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

iniciarServidor()