// Ponto de entrada: navegação entre telas (por #rota, funciona no GitHub Pages e offline).
import { carregarConteudo } from "./conteudo.js";
import { telaInicio } from "./telas/inicio.js";
import { telaTrilhas, telaTrilha, telaLicao } from "./telas/aprender.js";
import { telaObservar } from "./telas/observar.js";
import { telaPraticar } from "./telas/praticar.js";
import { telaDescobrir } from "./telas/descobrir.js";
import { telaAjuda } from "./telas/ajuda.js";
import { telaAjustes } from "./telas/ajustes.js";
import { esc } from "./ui.js";

// Cada rota: padrão, tela e a aba que fica acesa na barra de baixo.
const ROTAS = [
  [/^$/, telaInicio, "inicio"],
  [/^aprender$/, telaTrilhas, "aprender"],
  [/^aprender\/([\w-]+)$/, telaTrilha, "aprender"],
  [/^licao\/([\w-]+)$/, telaLicao, "aprender"],
  [/^observar$/, telaObservar, "observar"],
  [/^praticar$/, telaPraticar, "praticar"],
  [/^descobrir$/, telaDescobrir, "descobrir"],
  [/^ajuda$/, telaAjuda, null],
  [/^ajustes$/, telaAjustes, "inicio"]
];

const main = document.getElementById("tela");
let navegacao = 0;

async function mostrar() {
  const rota = decodeURIComponent(location.hash.replace(/^#\/?/, "")).replace(/\/$/, "");
  const minha = ++navegacao;
  let achou = ROTAS.find(([padrao]) => padrao.test(rota));
  if (!achou) { location.replace("#/"); return; }
  const [padrao, tela, aba] = achou;
  const params = rota.match(padrao).slice(1);

  document.querySelectorAll(".abas a").forEach((a) => {
    const ativa = a.dataset.aba === aba;
    a.classList.toggle("ativa", ativa);
    if (ativa) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.querySelector(".botao-ajuda")?.classList.toggle("ativa", rota === "ajuda");

  try {
    const conteudo = await carregarConteudo();
    const resultado = await tela({ params, conteudo });
    if (minha !== navegacao) return; // o usuário já foi para outra tela
    main.innerHTML = resultado.html;
    document.title = resultado.titulo ? `${resultado.titulo} · Bússola` : "Bússola";
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
    if (resultado.depois) resultado.depois(main);
  } catch (erro) {
    console.error(erro);
    main.innerHTML = `<section class="cartao"><h1>Algo deu errado</h1><p>${esc(erro.message || erro)}</p><p><a href="#/">Voltar ao início</a></p></section>`;
  }
}

window.addEventListener("hashchange", mostrar);
mostrar();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch((e) => console.warn("Sem modo offline:", e));
}
