// Conversor mínimo de Markdown para HTML, sem dependências.
// Usado no navegador (para mostrar as lições) e no Node (para validar o conteúdo).
// Suporta: ## e ### títulos, parágrafos, **negrito**, *itálico*, [links](url),
// listas com "-" ou "1.", citações com ">" e linhas horizontais "---".

export function escapar(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Formatação dentro de uma linha.
export function inline(md) {
  let s = escapar(md);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, texto, url) => {
    const seguro = /^(https?:|mailto:|tel:|#)/.test(url) ? url : "#";
    const externo = /^https?:/.test(seguro) ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${seguro}"${externo}>${texto}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return s;
}

export function markdownParaHtml(md) {
  const linhas = String(md || "").replace(/\r/g, "").split("\n");
  const saida = [];
  let paragrafo = [];
  let lista = null; // { tipo: "ul" | "ol", itens: [] }
  let citacao = [];

  const fecharParagrafo = () => {
    if (paragrafo.length) saida.push(`<p>${inline(paragrafo.join(" "))}</p>`);
    paragrafo = [];
  };
  const fecharLista = () => {
    if (lista) saida.push(`<${lista.tipo}>${lista.itens.map((i) => `<li>${inline(i)}</li>`).join("")}</${lista.tipo}>`);
    lista = null;
  };
  const fecharCitacao = () => {
    if (citacao.length) saida.push(`<blockquote>${markdownParaHtml(citacao.join("\n"))}</blockquote>`);
    citacao = [];
  };
  const fecharTudo = () => { fecharParagrafo(); fecharLista(); fecharCitacao(); };

  for (const bruta of linhas) {
    const linha = bruta.trimEnd();
    let m;
    if (/^>\s?/.test(linha)) {
      fecharParagrafo(); fecharLista();
      citacao.push(linha.replace(/^>\s?/, ""));
      continue;
    }
    fecharCitacao();
    if (!linha.trim()) { fecharParagrafo(); fecharLista(); continue; }
    if ((m = linha.match(/^(#{2,4})\s+(.*)$/))) {
      fecharTudo();
      const n = m[1].length;
      saida.push(`<h${n}>${inline(m[2])}</h${n}>`);
    } else if (/^---+$/.test(linha)) {
      fecharTudo();
      saida.push("<hr>");
    } else if ((m = linha.match(/^\s*[-*]\s+(.*)$/))) {
      fecharParagrafo();
      if (!lista || lista.tipo !== "ul") { fecharLista(); lista = { tipo: "ul", itens: [] }; }
      lista.itens.push(m[1]);
    } else if ((m = linha.match(/^\s*\d+[.)]\s+(.*)$/))) {
      fecharParagrafo();
      if (!lista || lista.tipo !== "ol") { fecharLista(); lista = { tipo: "ol", itens: [] }; }
      lista.itens.push(m[1]);
    } else if (lista && /^\s{2,}\S/.test(bruta)) {
      lista.itens[lista.itens.length - 1] += " " + linha.trim();
    } else {
      fecharLista();
      paragrafo.push(linha.trim());
    }
  }
  fecharTudo();
  return saida.join("\n");
}

// Texto puro (sem marcação), para contar palavras e, no futuro, para a narração.
export function textoPuro(md) {
  return String(md || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#]/g, "")
    .replace(/^\s*[-\d.]+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
