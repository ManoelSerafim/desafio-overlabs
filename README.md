# Desafio Backend Estágio Node.js - Overlabs

API desenvolvida em Node.js utilizando o framework Fastify para consumir, parsear e expor os metadados de filmes fornecidos pela API de testes da Overlabs.

---

## Tecnologias Utilizadas
- **Node.js** (Ambiente de execução JavaScript)
- **Fastify** (Framework web de alta performance e baixo overhead)
- **JavaScript (ES Modules / Async-Await)**
- **Copilot/ChatGPT** (Ajustes e correções gerais)

---

## Requisitos Atendidos

O projeto implementa todas as regras de transformação de dados e formatação exigidas no desafio:

1. **Transformação de Propriedades (Parse):**
   - **Lucro:** Cálculo matemático subtraindo o orçamento da bilheteria em string com conversão e formatação inteligente de valores textuais (bilhões, milhões, etc.).
   - **Premiação de Maior Relevância:** Identificação do prêmio com maior valor na propriedade `relevancia` utilizando `.reduce()`.
   - **Duração em Segundos:** Conversão da duração original (em minutos) para o padrão de segundos da plataforma (`duracao * 60`).
   - **Nota IMDb:** Extração segura da avaliação correspondente à fonte "IMDb" convertida para string.
   - **Sinopse Prioritária:** Lógica em cascata para retornar a sinopse priorizando o Português (`pt-br`), seguida por Inglês (`en`), ou a primeira ocorrência disponível.
2. **Remoção de Dados Desnecessários:**
   - Exclusão das propriedades `locacoes`, `poster` e `trailer` dos objetos retornados.
3. **Resiliência e Tratamento de Erros:**
   - Validação estrutural do retorno da API externa para garantir compatibilidade com arrays e evitar erros de execução (`TypeError`).
   - Tratamento de falhas de comunicação com retornos de códigos HTTP adequados (`502` / `500`).

---

## Passos Trilhados para o Desenvolvimento

1. **Configuração do Ambiente Inicial:**
   - Inicialização do projeto Node.js e instalação da dependência principal (`fastify`).
2. **Consumo da API Externa:**
   - Implementação da rota GET `/filmes` utilizando a função nativa `fetch` conectada à URL da AWS Lambda do desafio.
3. **Construção das Funções Auxiliares de Parse (`parseValor`, `formatarValor`):**
   - Criação de parsers para tratar strings monetárias com símbolos, pontuações variadas e sufixos textuais em português ("milhões", "bilhões").
4. **Implementação das Regras de Negócio:**
   - Mapeamento (`.map`) do array de filmes aplicando reduções para prêmios, buscas seguras (`.find`) para notas e sinopses, e estruturação do JSON de resposta limpo.
5. **Testes e Depuração:**
   - Execução local do servidor na porta `3000` e refinamento do tratamento de exceções para garantir estabilidade frente a eventuais variações dos dados externos.

---

## Instruções de Instalação e Execução

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em seu computador.

### Passo a passo:

1. Salve o código principal da API em um arquivo chamado
`server.js`.
2. Instale o Fastify no diretório do projeto:

```bash
npm install fastify
```

3. Inicie o servidor da aplicação:
```bash
node server.js
```

4. O servidor estará rodando e pronto para uso em:
* `http://localhost:3000/filmes`

---

## Exemplo de Rota

* **Endpoint:** `GET /filmes`
* **Retorno Esperado:**
```json
[
  {
    "titulo": "O Poderoso Chefão",
    "ano": 1972,
    "diretor": "Francis Ford Coppola",
    "genero": [
      "Crime",
      "Drama"
    ],
    "duracaoSegundos": 10500,
    "notaIMDb": "9.2",
    "lucro": "$239 milhões",
    "maiorPremiacao": "Oscar de Melhor Filme",
    "sinopse": "Um chefão da máfia tenta transferir o controle de seu império clandestino para seu filho relutante."
  },
]
```
