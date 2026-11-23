// Tela inicial: continuar de onde parou e os quatro pilares.
import * as dados from "../dados.js";
import { esc, icone } from "../ui.js";

const PILARES = [
  { id: "aprender", nome: "Aprender", texto: "Trilhas com lições curtas sobre você e a sua forma de funcionar." },
  { id: "observar", nome: "Se observar", texto: "Check-in diário, diário com tags e os padrões que aparecem com o tempo." },
  { id: "praticar", nome: "Praticar", texto: "Exercícios guiados, apostas pequenas e hábitos simples." },
  { id: "descobrir", nome: "Descobrir", texto: "Uma biblioteca de conceitos da psicologia em que você pode se reconhecer." }
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 5) return "Boa noite";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export async function telaInicio({ conteudo }) {
  const progresso = await dados.listar("progresso");
  const emAndamento = progresso
    .filter((p) => !p.concluidaEm && p.abertaEm && conteudo.licoes[p.licaoId])
    .sort((a, b) => b.abertaEm.localeCompare(a.abertaEm))[0];

  // Sem nada em andamento: sugere a primeira lição ainda não concluída.
  let sugestao = emAndamento && conteudo.licoes[emAndamento.licaoId];
  let rotulo = "Continuar de onde parou";
  if (!sugestao) {
    const feitas = new Set(progresso.filter((p) => p.concluidaEm).map((p) => p.licaoId));
    for (const t of conteudo.trilhas) {
      const id = t.licoes.find((x) => !feitas.has(x));
      if (id) { sugestao = conteudo.licoes[id]; break; }
    }
    rotulo = feitas.size ? "Próxima lição" : "Para começar";
  }

  const continuar = sugestao
    ? `<a class="cartao destaque" href="#/licao/${sugestao.id}">
        <p class="sobretitulo">${rotulo}</p>
        <h2>${esc(sugestao.titulo)}</h2>
        <p class="pequeno">~${sugestao.duracaoMin} min de leitura</p>
      </a>`
    : "";

  const pilares = PILARES.map((p) => `<a class="cartao pilar" href="#/${p.id}">
      ${icone(p.id, "icone grande")}
      <span><strong>${p.nome}</strong><span class="pequeno">${p.texto}</span></span>
    </a>`).join("");

  return {
    titulo: "",
    html: `<header class="topo-tela"><h1>${saudacao()}.</h1>
        <p class="intro">Um espaço seu para se entender melhor, no seu ritmo.</p></header>
      ${continuar}
      <div class="grade-pilares">${pilares}</div>
      <p class="lembrete">A Bússola é educativa e não substitui acompanhamento psicológico. Se algo estiver pesando, veja <a href="#/ajuda">Quando buscar ajuda</a>.</p>
      <p class="rodape-links"><a href="#/ajustes">${icone("ajustes")} Ajustes e backup</a></p>`
  };
}
