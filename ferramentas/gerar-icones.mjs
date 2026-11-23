// Gera os PNGs do ícone a partir de imagens/icone.svg (usa o Playwright já instalado).
// Uso: node ferramentas/gerar-icones.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url).pathname;
const svg = readFileSync(RAIZ + "imagens/icone.svg", "utf8");
const navegador = await chromium.launch();
for (const tam of [180, 192, 512]) {
  const pagina = await navegador.newPage({ viewport: { width: tam, height: tam } });
  // Ícone do iPhone/Android: quadrado cheio (o sistema arredonda os cantos).
  await pagina.setContent(`<body style="margin:0;background:#2d7569">${svg.replace("<svg ", `<svg width="${tam}" height="${tam}" `).replace('rx="112"', 'rx="0"')}</body>`);
  await pagina.screenshot({ path: `${RAIZ}imagens/icone-${tam}.png`, omitBackground: false });
  await pagina.close();
}
await navegador.close();
console.log("Ícones gerados em imagens/.");
