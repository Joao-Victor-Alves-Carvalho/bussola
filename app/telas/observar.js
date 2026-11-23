// Pilar Se observar. Check-in e gráficos chegam na fase 3; por enquanto, as reflexões salvas.
import * as dados from "../dados.js";
import { esc, dataCurta, icone } from "../ui.js";

export async function telaObservar({ conteudo }) {
  const entradas = (await dados.listar("diario")).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const lista = entradas.length
    ? entradas.map((e) => {
        const licao = e.origem?.licaoId && conteudo.licoes[e.origem.licaoId];
        return `<article class="cartao entrada">
          <p class="pequeno">${dataCurta(e.criadoEm)}${(e.tags || []).map((t) => ` · #${esc(t)}`).join("")}</p>
          ${e.origem?.pergunta ? `<p class="enunciado">${esc(e.origem.pergunta)}</p>` : ""}
          ${esc(e.texto).split(/\n+/).map((p) => `<p>${p}</p>`).join("")}
          ${licao ? `<p class="pequeno"><a href="#/licao/${licao.id}">${esc(licao.titulo)}</a></p>` : ""}
        </article>`;
      }).join("")
    : `<p class="vazio">Ainda não há nada aqui. As respostas que você escrever em "Para refletir", nas lições, aparecem nesta tela.</p>`;

  return {
    titulo: "Se observar",
    html: `<header class="topo-tela"><p class="sobretitulo">Pilar</p><h1>Se observar</h1>
        <p class="intro">Perceber como você está, dia após dia, para enxergar padrões que passam despercebidos.</p></header>
      <div class="cartao em-breve">${icone("observar", "icone grande")}
        <div><strong>Chegando na fase 3</strong>
        <p class="pequeno">Check-in diário em menos de 1 minuto (humor, energia, estímulo, contato social), diário livre com tags e gráficos de padrões.</p></div></div>
      <h2 class="secao">Suas reflexões</h2>
      <div class="lista">${lista}</div>`
  };
}
