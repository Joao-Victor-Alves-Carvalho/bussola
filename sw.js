// Service worker: deixa o app funcionar sem internet.
// - Código e conteúdo: tenta a rede primeiro (para pegar atualizações) e, sem rede, usa a cópia guardada.
// - Áudios e imagens: usa a cópia guardada primeiro (nunca mudam; o nome do áudio é o hash do roteiro).
// Ao criar um arquivo novo em app/, acrescente-o em ESSENCIAIS.

const CACHE = "bussola-v1";
const ESSENCIAIS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "app/estilo.css",
  "app/main.js",
  "app/markdown.js",
  "app/conteudo.js",
  "app/dados.js",
  "app/ui.js",
  "app/telas/inicio.js",
  "app/telas/aprender.js",
  "app/telas/observar.js",
  "app/telas/praticar.js",
  "app/telas/descobrir.js",
  "app/telas/ajuda.js",
  "app/telas/ajustes.js",
  "dados/conteudo.json",
  "imagens/icone.svg",
  "imagens/icone-180.png",
  "imagens/icone-192.png",
  "imagens/icone-512.png"
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS.map((u) => new Request(u, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function redeComLimite(req, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("tempo esgotado")), ms);
    fetch(req, { cache: "no-cache" }).then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function redePrimeiro(req) {
  const cache = await caches.open(CACHE);
  try {
    const resp = await redeComLimite(req, 4000);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    const guardada = await cache.match(req, { ignoreSearch: true });
    if (guardada) return guardada;
    if (req.mode === "navigate") return cache.match("index.html");
    throw e;
  }
}

async function cachePrimeiro(req) {
  const cache = await caches.open(CACHE);
  const guardada = await cache.match(req);
  if (guardada) return guardada;
  const resp = await fetch(req);
  if (resp.ok) cache.put(req, resp.clone());
  return resp;
}

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Pedidos parciais (Range), usados pelo player de áudio, vão direto para a rede/cache do navegador.
  if (req.headers.has("range")) return;
  if (/\/(audio|imagens)\//.test(url.pathname)) ev.respondWith(cachePrimeiro(req));
  else ev.respondWith(redePrimeiro(req));
});
