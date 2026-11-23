// Lê o conteúdo em conteudo/ (Markdown com cabeçalho) e gera dados/conteudo.json,
// que é o que o app carrega. Também valida cada lição: se faltar algo, para com erro.
//
// Uso: node ferramentas/montar-conteudo.mjs
//
// Formato de uma lição (conteudo/trilhas/<pasta-da-trilha>/<arquivo>.md):
//
//   ---
//   id: pas-does
//   ordem: 1
//   titulo: O que é ser uma Pessoa Altamente Sensível
//   evidencia: com-bom-suporte        (consolidado | com-bom-suporte | popular-mas-debatido)
//   ---
//   # Texto                            (o texto da lição, com ## subtítulos)
//   # Narração                         (opcional: roteiro adaptado para ser ouvido)
//   # Você pode se identificar se      (lista com 3 a 5 sinais)
//   # Para refletir                    (lista com 1 a 3 perguntas)
//   # Prática sugerida                 (texto curto)
//   # Para saber mais                  (lista de referências)
//
// Cada trilha tem um _trilha.md com id, ordem, titulo, status (disponivel | em-breve),
// uma # Descrição e, opcionalmente, # Lições planejadas.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { textoPuro } from "../app/markdown.js";

const RAIZ = new URL("..", import.meta.url).pathname;
const PALAVRAS_POR_MINUTO = 150; // leitura atenta em português, com pausas para pensar
const EVIDENCIAS = ["consolidado", "com-bom-suporte", "popular-mas-debatido"];

const SECOES = {
  "texto": "texto",
  "narração": "narracao",
  "você pode se identificar se": "sinais",
  "para refletir": "perguntas",
  "prática sugerida": "pratica",
  "para saber mais": "referencias",
  "descrição": "descricao",
  "lições planejadas": "planejadas"
};
const SECOES_LISTA = new Set(["sinais", "perguntas", "referencias", "planejadas"]);

const erros = [];
const erro = (arquivo, msg) => erros.push(`${arquivo}: ${msg}`);

function lerArquivo(caminho) {
  const bruto = readFileSync(caminho, "utf8").replace(/\r/g, "");
  const m = bruto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) { erro(caminho, "falta o cabeçalho entre ---"); return null; }
  const meta = {};
  for (const linha of m[1].split("\n")) {
    const kv = linha.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim().replace(/^"(.*)"$/, "$1");
    meta[kv[1]] = /^\d+$/.test(v) ? Number(v) : v;
  }
  const secoes = {};
  let atual = null;
  for (const linha of m[2].split("\n")) {
    const h = linha.match(/^#\s+(.+?)\s*\.{0,3}…?\s*$/);
    if (h) {
      const chave = SECOES[h[1].toLowerCase()];
      if (!chave) { erro(caminho, `seção desconhecida "# ${h[1]}"`); atual = null; continue; }
      atual = chave;
      secoes[atual] = [];
      continue;
    }
    if (atual) secoes[atual].push(linha);
  }
  const resultado = { meta };
  for (const [chave, linhas] of Object.entries(secoes)) {
    const texto = linhas.join("\n").trim();
    if (SECOES_LISTA.has(chave)) {
      const itens = [];
      for (const l of texto.split("\n")) {
        const item = l.match(/^\s*[-*]\s+(.*)$/);
        if (item) itens.push(item[1].trim());
        else if (l.trim() && itens.length) itens[itens.length - 1] += " " + l.trim();
      }
      resultado[chave] = itens;
    } else {
      resultado[chave] = texto;
    }
  }
  return resultado;
}

const contarPalavras = (md) => (textoPuro(md).match(/\S+/g) || []).length;

const pastaTrilhas = RAIZ + "conteudo/trilhas/";
const trilhas = [];
const licoes = {};

for (const pasta of readdirSync(pastaTrilhas).sort()) {
  const base = pastaTrilhas + pasta + "/";
  if (!existsSync(base + "_trilha.md")) continue;
  const t = lerArquivo(base + "_trilha.md");
  if (!t) continue;
  const { id, ordem, titulo, status = "disponivel" } = t.meta;
  if (!id || !titulo) erro(base + "_trilha.md", "precisa de id e titulo");
  const trilha = {
    id, ordem, titulo, status,
    descricao: t.descricao || "",
    planejadas: t.planejadas || [],
    licoes: []
  };

  const arquivos = readdirSync(base).filter((f) => f.endsWith(".md") && f !== "_trilha.md");
  const daTrilha = [];
  for (const f of arquivos) {
    const caminho = base + f;
    const l = lerArquivo(caminho);
    if (!l) continue;
    const m = l.meta;
    if (!m.id) erro(caminho, "falta id");
    if (!m.titulo) erro(caminho, "falta titulo");
    if (typeof m.ordem !== "number") erro(caminho, "falta ordem (número)");
    if (!EVIDENCIAS.includes(m.evidencia)) erro(caminho, `evidencia deve ser: ${EVIDENCIAS.join(", ")}`);
    if (!l.texto) erro(caminho, "falta # Texto");
    const sinais = l.sinais || [];
    if (sinais.length < 3 || sinais.length > 5) erro(caminho, `"Você pode se identificar se" precisa de 3 a 5 itens (tem ${sinais.length})`);
    const perguntas = l.perguntas || [];
    if (perguntas.length < 1 || perguntas.length > 3) erro(caminho, `"Para refletir" precisa de 1 a 3 perguntas (tem ${perguntas.length})`);
    if (!l.pratica) erro(caminho, "falta # Prática sugerida");
    if (!(l.referencias || []).length) erro(caminho, "falta # Para saber mais");
    if (licoes[m.id]) erro(caminho, `id repetido: ${m.id}`);

    const palavras = contarPalavras([l.texto, ...sinais, ...perguntas, l.pratica || ""].join("\n"));
    daTrilha.push({
      id: m.id,
      trilha: id,
      ordem: m.ordem,
      titulo: m.titulo,
      duracaoMin: Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO)),
      palavras,
      evidencia: m.evidencia,
      texto: l.texto,
      narracao: l.narracao || null,
      sinais,
      perguntas,
      pratica: l.pratica || "",
      referencias: l.referencias || []
    });
  }
  daTrilha.sort((a, b) => a.ordem - b.ordem);
  for (const l of daTrilha) { licoes[l.id] = l; trilha.licoes.push(l.id); }
  if (trilha.status === "disponivel" && !trilha.licoes.length) erro(base, "trilha disponível sem lições");
  trilhas.push(trilha);
}
trilhas.sort((a, b) => a.ordem - b.ordem);

if (erros.length) {
  console.error("Conteúdo com problemas:\n- " + erros.join("\n- "));
  process.exit(1);
}

mkdirSync(RAIZ + "dados", { recursive: true });
const saida = { formato: 1, trilhas, licoes };
writeFileSync(RAIZ + "dados/conteudo.json", JSON.stringify(saida, null, 1) + "\n");

for (const t of trilhas) {
  console.log(`${t.titulo} (${t.status}): ${t.licoes.length} lições`);
  for (const id of t.licoes) {
    const l = licoes[id];
    console.log(`  ${l.ordem}. ${l.titulo} — ${l.palavras} palavras, ~${l.duracaoMin} min`);
  }
}
console.log("Gerado: dados/conteudo.json");
