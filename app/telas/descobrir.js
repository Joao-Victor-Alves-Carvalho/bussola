// Pilar Descobrir. A biblioteca de conceitos e as sugestões por regras chegam na fase 4.
import { icone } from "../ui.js";

const CATALOGO_PREVISTO = [
  "Ruminação", "Ressaca social", "Janela de tolerância", "Perfeccionismo", "Síndrome do impostor",
  "People pleasing", "Evitação experiencial", "Procrastinação emocional", "Efeito holofote", "Desamparo aprendido"
];

export async function telaDescobrir() {
  return {
    titulo: "Descobrir",
    html: `<header class="topo-tela"><p class="sobretitulo">Pilar</p><h1>Descobrir</h1>
        <p class="intro">Fenômenos e conceitos da psicologia que você talvez nem saiba que têm nome, e em que talvez se reconheça.</p></header>
      <div class="cartao em-breve">${icone("descobrir", "icone grande")}
        <div><strong>Chegando na fase 4</strong>
        <p class="pequeno">Cada conceito com um resumo curto, "você pode se identificar se…", nível de evidência e um botão "Me identifiquei", que vai montando o seu mapa de traços. Sugestões a partir dos seus check-ins, sem IA.</p></div></div>
      <h2 class="secao">Primeiros conceitos da biblioteca</h2>
      <ul class="etiquetas">${CATALOGO_PREVISTO.map((c) => `<li>${c}</li>`).join("")}</ul>`
  };
}
