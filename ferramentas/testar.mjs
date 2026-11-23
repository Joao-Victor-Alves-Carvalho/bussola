// Teste de fumaça no navegador (Playwright): abre todas as telas, salva uma reflexão,
// conclui uma lição, exporta/importa o backup e confere o modo offline.
// Uso: node ferramentas/testar.mjs [pasta-para-capturas]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const { chromium } = createRequire(import.meta.url)("playwright");
const RAIZ = new URL("..", import.meta.url).pathname;
const PORTA = 8765;
const BASE = `http://localhost:${PORTA}/`;
const capturas = process.argv[2];

const servidor = spawn("python3", ["-m", "http.server", String(PORTA), "--bind", "127.0.0.1"], { cwd: RAIZ, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));

const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); console.log((cond ? "  ok  " : "  FALHOU  ") + msg); };

const navegador = await chromium.launch();
try {
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on("pageerror", (e) => erros.push(e.message));
  pagina.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });

  const conteudo = await (await fetch(BASE + "dados/conteudo.json")).json();
  const foto = async (nome) => { if (capturas) await pagina.screenshot({ path: `${capturas}/${nome}.png`, fullPage: false }); };

  await pagina.goto(BASE);
  await pagina.waitForSelector(".grade-pilares");
  ok((await pagina.locator(".cartao.pilar").count()) === 4, "início mostra os 4 pilares");
  await foto("01-inicio");

  for (const rota of ["aprender", "observar", "praticar", "descobrir", "ajuda", "ajustes"]) {
    await pagina.goto(BASE + "#/" + rota);
    await pagina.waitForSelector("main h1");
    ok(!(await pagina.locator("main").innerText()).includes("Algo deu errado"), `tela ${rota} abre`);
    await foto("tela-" + rota);
  }
  ok(await pagina.goto(BASE + "#/ajuda").then(() => pagina.locator('a[href="tel:188"]').count()) > 0, "ajuda tem o CVV 188");

  for (const t of conteudo.trilhas.filter((x) => x.status === "disponivel")) {
    await pagina.goto(BASE + "#/aprender/" + t.id);
    await pagina.waitForSelector(".licoes");
    ok((await pagina.locator(".item-licao").count()) === t.licoes.length, `trilha ${t.id} lista ${t.licoes.length} lições`);
    for (const id of t.licoes) {
      await pagina.goto(BASE + "#/licao/" + id);
      await pagina.waitForSelector(".corpo h2");
      ok((await pagina.locator(".bloco.sinais li").count()) >= 3, `lição ${id} abre com sinais`);
    }
  }

  const primeira = conteudo.trilhas[0].licoes[0];
  await pagina.goto(BASE + "#/licao/" + primeira);
  await pagina.waitForSelector(".corpo");
  await foto("02-licao");
  await pagina.locator(".pergunta").first().locator("summary").click();
  await pagina.locator("#r0").fill("Reconheço muito o S: percebo tudo.");
  await pagina.locator('[data-salvar="0"]').click();
  await pagina.waitForSelector(".resposta");
  ok((await pagina.locator(".resposta").count()) === 1, "reflexão salva aparece na lição");
  await pagina.locator("[data-concluir]").click();
  await pagina.waitForTimeout(200);

  await pagina.goto(BASE + "#/observar");
  await pagina.waitForSelector(".entrada");
  ok((await pagina.locator(".entrada").count()) === 1, "reflexão aparece em Se observar");

  await pagina.goto(BASE + "#/aprender/" + conteudo.trilhas[0].id);
  await pagina.waitForSelector(".item-licao");
  ok((await pagina.locator(".item-licao.feita").count()) === 1, "lição marcada como concluída na trilha");
  await foto("03-trilha");

  await pagina.goto(BASE);
  await pagina.waitForSelector(".cartao.destaque");
  // A última lição aberta e não concluída (o loop acima abriu todas) aparece como "continuar".
  const ultima = conteudo.trilhas[0].licoes.at(-1);
  ok((await pagina.locator(".cartao.destaque").innerText()).includes(conteudo.licoes[ultima].titulo), "início sugere continuar a última lição aberta");

  // Backup: exporta, apaga tudo e importa de volta.
  await pagina.goto(BASE + "#/ajustes");
  await pagina.waitForSelector("[data-exportar]");
  const [download] = await Promise.all([pagina.waitForEvent("download"), pagina.locator("[data-exportar]").click()]);
  const arquivo = await download.path();
  const backup = JSON.parse(await (await import("node:fs/promises")).readFile(arquivo, "utf8"));
  ok(backup.app === "bussola" && backup.dados.diario.length === 1 && backup.dados.progresso.length >= 1, "backup exportado com os dados");
  pagina.on("dialog", (d) => d.accept());
  await pagina.locator("[data-apagar]").click();
  await pagina.waitForTimeout(300);
  await pagina.goto(BASE + "#/observar");
  await pagina.waitForSelector(".vazio");
  ok(true, "apagar tudo limpa o diário");
  await pagina.goto(BASE + "#/ajustes");
  await pagina.locator("[data-importar]").setInputFiles(arquivo);
  await pagina.waitForTimeout(500);
  await pagina.goto(BASE + "#/observar");
  await pagina.waitForSelector(".entrada");
  ok(true, "importar backup restaura o diário");

  // Offline: com o service worker ativo, o app recarrega sem rede.
  await pagina.goto(BASE);
  await pagina.evaluate(() => navigator.serviceWorker.ready);
  await pagina.reload();
  await pagina.waitForSelector(".grade-pilares");
  await contexto.setOffline(true);
  await pagina.reload();
  await pagina.goto(BASE + "#/licao/" + conteudo.trilhas[0].licoes[2]);
  await pagina.waitForSelector(".corpo h2", { timeout: 8000 });
  ok(true, "funciona offline");
  await contexto.setOffline(false);

  // Tema escuro.
  const escuro = await navegador.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const p2 = await escuro.newPage();
  await p2.goto(BASE + "#/licao/" + primeira);
  await p2.waitForSelector(".corpo");
  if (capturas) await p2.screenshot({ path: `${capturas}/04-licao-escuro.png` });
  await escuro.close();

  const reais = erros.filter((e) => !/favicon/.test(e));
  ok(reais.length === 0, "sem erros no console" + (reais.length ? ": " + reais.join(" | ") : ""));
} finally {
  await navegador.close();
  servidor.kill();
}

if (falhas.length) { console.log(`\n${falhas.length} falha(s).`); process.exit(1); }
console.log("\nTudo certo.");
