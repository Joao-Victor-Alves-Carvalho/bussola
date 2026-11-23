// Pilar Praticar. Exercícios em áudio e apostas pequenas chegam na fase 4;
// por enquanto, reúne as práticas sugeridas nas lições.
import { markdownParaHtml } from "../markdown.js";
import { esc, icone } from "../ui.js";

export async function telaPraticar({ conteudo }) {
  const praticas = conteudo.trilhas.flatMap((t) => t.licoes.map((id) => conteudo.licoes[id]))
    .map((l) => `<article class="cartao">
      ${markdownParaHtml(l.pratica)}
      <p class="pequeno">Da lição <a href="#/licao/${l.id}">${esc(l.titulo)}</a></p>
    </article>`).join("");

  return {
    titulo: "Praticar",
    html: `<header class="topo-tela"><p class="sobretitulo">Pilar</p><h1>Praticar</h1>
        <p class="intro">Entender é o começo. Mudar acontece em passos pequenos, repetidos.</p></header>
      <div class="cartao em-breve">${icone("praticar", "icone grande")}
        <div><strong>Chegando na fase 4</strong>
        <p class="pequeno">Exercícios guiados em áudio (descompressão, respiração, reflexão, autocompaixão), apostas pequenas com reflexão depois e hábitos ligados às lições.</p></div></div>
      <h2 class="secao">Práticas das lições</h2>
      <div class="lista">${praticas}</div>`
  };
}
