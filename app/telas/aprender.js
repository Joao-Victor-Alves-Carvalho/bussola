// Pilar Aprender: lista de trilhas, uma trilha e a lição.
import { markdownParaHtml, inline } from "../markdown.js";
import { NIVEIS_EVIDENCIA } from "../conteudo.js";
import * as dados from "../dados.js";
import { esc, icone, aviso, dataCurta, cabecalhoVoltar } from "../ui.js";

async function progressoPorLicao() {
  const mapa = {};
  for (const p of await dados.listar("progresso")) mapa[p.licaoId] = p;
  return mapa;
}

function barra(feitas, total) {
  const pct = total ? Math.round((feitas / total) * 100) : 0;
  return `<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${feitas}" aria-label="${feitas} de ${total} lições concluídas"><span style="width:${pct}%"></span></div>`;
}

export async function telaTrilhas({ conteudo }) {
  const prog = await progressoPorLicao();
  const cartoes = conteudo.trilhas.map((t) => {
    if (t.status !== "disponivel") {
      return `<div class="cartao trilha bloqueada">
        <p class="sobretitulo">Trilha ${t.ordem} · em breve</p>
        <h2>${esc(t.titulo)}</h2>
        <p>${inline(t.descricao)}</p>
      </div>`;
    }
    const feitas = t.licoes.filter((id) => prog[id]?.concluidaEm).length;
    return `<a class="cartao trilha" href="#/aprender/${t.id}">
      <p class="sobretitulo">Trilha ${t.ordem} · ${t.licoes.length} lições</p>
      <h2>${esc(t.titulo)}</h2>
      <p>${inline(t.descricao)}</p>
      ${barra(feitas, t.licoes.length)}
      <p class="pequeno">${feitas} de ${t.licoes.length} concluídas</p>
    </a>`;
  }).join("");
  return {
    titulo: "Aprender",
    html: `<header class="topo-tela"><p class="sobretitulo">Pilar</p><h1>Aprender</h1>
      <p class="intro">Lições curtas, de 5 a 10 minutos, organizadas em trilhas. Leia no seu ritmo.</p></header>
      <div class="lista">${cartoes}</div>`
  };
}

export async function telaTrilha({ params: [id], conteudo }) {
  const t = conteudo.trilhas.find((x) => x.id === id);
  if (!t) throw new Error("Trilha não encontrada.");
  const prog = await progressoPorLicao();
  const itens = t.licoes.map((lid) => {
    const l = conteudo.licoes[lid];
    const feita = !!prog[lid]?.concluidaEm;
    return `<li><a class="item-licao${feita ? " feita" : ""}" href="#/licao/${l.id}">
      <span class="numero">${feita ? icone("check") : l.ordem}</span>
      <span class="texto"><strong>${esc(l.titulo)}</strong><span class="pequeno">~${l.duracaoMin} min de leitura${feita ? " · concluída" : ""}</span></span>
      ${icone("seguir", "icone seta")}
    </a></li>`;
  }).join("");
  const planejadas = t.planejadas.length
    ? `<h2 class="secao">Em breve</h2><ul class="lista-simples">${t.planejadas.map((p) => `<li>${inline(p)}</li>`).join("")}</ul>`
    : "";
  const feitas = t.licoes.filter((lid) => prog[lid]?.concluidaEm).length;
  return {
    titulo: t.titulo,
    html: `${cabecalhoVoltar("#/aprender", "Trilhas")}
      <header class="topo-tela"><p class="sobretitulo">Trilha ${t.ordem}</p><h1>${esc(t.titulo)}</h1>
      <p class="intro">${inline(t.descricao)}</p>
      ${t.licoes.length ? barra(feitas, t.licoes.length) : ""}</header>
      <ol class="licoes">${itens}</ol>${planejadas}`
  };
}

export async function telaLicao({ params: [id], conteudo }) {
  const l = conteudo.licoes[id];
  if (!l) throw new Error("Lição não encontrada.");
  const t = conteudo.trilhas.find((x) => x.id === l.trilha);
  const idx = t.licoes.indexOf(l.id);
  const proxima = conteudo.licoes[t.licoes[idx + 1]];
  await dados.registrarAbertura(l);
  const prog = await dados.obter("progresso", l.id);
  const reflexoes = await dados.reflexoesDaLicao(l.id);
  const ev = NIVEIS_EVIDENCIA[l.evidencia];

  const perguntas = l.perguntas.map((p, i) => {
    const anteriores = reflexoes.filter((r) => r.origem.pergunta === p);
    return `<div class="pergunta" data-i="${i}">
      <p class="enunciado">${inline(p)}</p>
      <div class="respostas">${anteriores.map(respostaHtml).join("")}</div>
      <details class="responder"><summary>Escrever uma resposta</summary>
        <label class="oculto" for="r${i}">Sua resposta</label>
        <textarea id="r${i}" rows="4" placeholder="Escreva com calma. Fica só no seu dispositivo."></textarea>
        <button class="botao" data-salvar="${i}">Salvar no diário</button>
      </details>
    </div>`;
  }).join("");

  const html = `${cabecalhoVoltar("#/aprender/" + t.id, t.titulo)}
    <article class="licao">
      <header class="topo-tela">
        <p class="sobretitulo">Trilha ${t.ordem} · Lição ${l.ordem} de ${t.licoes.length}</p>
        <h1>${esc(l.titulo)}</h1>
        <p class="meta"><span>~${l.duracaoMin} min de leitura</span>
          <button class="selo selo-${l.evidencia}" data-evidencia aria-expanded="false">Evidência: ${ev.nome}</button></p>
        <p class="explica-evidencia" hidden>${ev.explicacao}</p>
      </header>
      <div class="corpo">${markdownParaHtml(l.texto)}</div>

      <section class="bloco sinais">
        <h2>Você pode se identificar se…</h2>
        <ul>${l.sinais.map((s) => `<li>${inline(s)}</li>`).join("")}</ul>
      </section>

      <section class="bloco refletir">
        <h2>Para refletir</h2>
        ${perguntas}
      </section>

      <section class="bloco pratica">
        <h2>Prática sugerida</h2>
        ${markdownParaHtml(l.pratica)}
      </section>

      <section class="bloco referencias">
        <h2>Para saber mais</h2>
        <ul>${l.referencias.map((r) => `<li>${inline(r)}</li>`).join("")}</ul>
      </section>

      <p class="lembrete">Conteúdo educativo, não um diagnóstico. Se algo estiver pesando demais, veja <a href="#/ajuda">Quando buscar ajuda</a>.</p>

      <div class="acoes-licao">
        <button class="botao ${prog?.concluidaEm ? "secundario" : ""}" data-concluir>${prog?.concluidaEm ? icone("check") + " Concluída" : "Marcar como concluída"}</button>
        ${proxima ? `<a class="botao secundario" href="#/licao/${proxima.id}">Próxima: ${esc(proxima.titulo)} ${icone("seguir")}</a>` : `<a class="botao secundario" href="#/aprender/${t.id}">Voltar à trilha</a>`}
      </div>
    </article>`;

  return {
    titulo: l.titulo,
    html,
    depois(el) {
      const selo = el.querySelector("[data-evidencia]");
      const explica = el.querySelector(".explica-evidencia");
      selo.addEventListener("click", () => {
        explica.hidden = !explica.hidden;
        selo.setAttribute("aria-expanded", String(!explica.hidden));
      });

      const concluir = el.querySelector("[data-concluir]");
      let concluida = !!prog?.concluidaEm;
      concluir.addEventListener("click", async () => {
        concluida = !concluida;
        await dados.marcarConcluida(l, concluida);
        concluir.innerHTML = concluida ? icone("check") + " Concluída" : "Marcar como concluída";
        concluir.classList.toggle("secundario", concluida);
        aviso(concluida ? "Lição concluída." : "Marcada como não concluída.");
      });

      el.querySelectorAll("[data-salvar]").forEach((botao) => {
        botao.addEventListener("click", async () => {
          const i = Number(botao.dataset.salvar);
          const caixa = el.querySelector(`#r${i}`);
          const texto = caixa.value.trim();
          if (!texto) { caixa.focus(); return; }
          const reg = await dados.salvarReflexao(l, l.perguntas[i], texto);
          el.querySelector(`.pergunta[data-i="${i}"] .respostas`).insertAdjacentHTML("beforeend", respostaHtml(reg));
          caixa.value = "";
          botao.closest("details").open = false;
          aviso("Salvo no diário.");
        });
      });
    }
  };
}

function respostaHtml(r) {
  const paragrafos = esc(r.texto).split(/\n+/).map((p) => `<p>${p}</p>`).join("");
  return `<div class="resposta"><p class="pequeno">${dataCurta(r.criadoEm)}</p>${paragrafos}</div>`;
}
