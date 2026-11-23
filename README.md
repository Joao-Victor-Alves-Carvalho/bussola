# Bússola

App pessoal de autoconhecimento e desenvolvimento pessoal. É educativo, não faz diagnóstico e não substitui psicólogo.

Quatro pilares: **Aprender** (trilhas de lições em texto e áudio), **Se observar** (check-in, diário e padrões), **Praticar** (exercícios guiados e apostas pequenas) e **Descobrir** (biblioteca de conceitos da psicologia).

## Como funciona

- **PWA local-first**, em HTML, CSS e JavaScript puros, sem framework e sem build. Funciona offline e pode ser instalado na tela inicial.
- **Dados pessoais** (diário, check-ins, progresso) ficam só no dispositivo, em IndexedDB. Não há nuvem, conta, analytics nem rastreamento. O backup é exportado e importado em JSON, em *Ajustes*.
- **Conteúdo** separado do código: cada lição é um arquivo Markdown em `conteudo/`, convertido em `dados/conteudo.json`. Esse arquivo pode ser reaproveitado por outros projetos, como a Joy.

## Estrutura

```
index.html, sw.js, manifest.webmanifest
app/            código do app (main.js, dados.js, conteudo.js, markdown.js, ui.js, estilo.css)
app/telas/      uma tela por arquivo
conteudo/       trilhas e lições em Markdown (fonte)
dados/          conteudo.json gerado (não editar à mão)
ferramentas/    scripts: montar conteúdo, testar, gerar ícones
imagens/        ícones
```

## Comandos

```
node ferramentas/montar-conteudo.mjs   # depois de editar algo em conteudo/
python3 -m http.server 8000            # abrir em http://localhost:8000
node ferramentas/testar.mjs            # teste no navegador (Playwright)
```

## Fases

1. **Fundação** (feita): estrutura, navegação, Trilha 1 em texto, ajuda, backup e modo offline.
2. Áudio: narração com o ElevenLabs gerada uma única vez e player.
3. Se observar: check-in, diário com tags e gráficos.
4. Praticar e Descobrir: exercícios, apostas pequenas, biblioteca e sugestões por regras.
5. Trilhas 2 e 3.
6. Futuro: IA pontual e integração com a Joy.

## Quando buscar ajuda

CVV: ligue **188** ou acesse [cvv.org.br](https://cvv.org.br). Em emergência, SAMU **192**.
