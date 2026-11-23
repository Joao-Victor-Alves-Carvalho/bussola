// Carrega o conteúdo (trilhas e lições) gerado em dados/conteudo.json.
// O conteúdo é público e fica separado dos dados pessoais (app/dados.js).

let cache = null;

export async function carregarConteudo() {
  if (!cache) {
    cache = fetch("dados/conteudo.json").then((r) => {
      if (!r.ok) throw new Error("Não consegui carregar o conteúdo (" + r.status + ").");
      return r.json();
    });
  }
  return cache;
}

export const NIVEIS_EVIDENCIA = {
  "consolidado": {
    nome: "Consolidado",
    explicacao: "Décadas de pesquisa e amplo consenso entre especialistas."
  },
  "com-bom-suporte": {
    nome: "Com bom suporte",
    explicacao: "Pesquisas consistentes apoiam a ideia, mas ainda há pontos em estudo ou em debate."
  },
  "popular-mas-debatido": {
    nome: "Popular, mas debatido",
    explicacao: "Ideia conhecida e muitas vezes útil, mas com evidência limitada ou contestada."
  }
};
