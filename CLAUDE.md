# Bússola: como trabalhar neste projeto

App pessoal de autoconhecimento (PWA local-first, GitHub Pages). Idioma do usuário: português do Brasil.
Projeto independente da Jornada do Herói: **não misture os dois repositórios**. Só ideias podem ser reaproveitadas.
A especificação original fica com o usuário (tem dados pessoais e não vai para o repositório). As fases estão no README.

## Regras de conteúdo
- Tom acolhedor, direto e sem jargão, como um amigo que estudou o assunto.
- Educativo, **nunca diagnóstico**: "você pode se identificar", nunca "você tem".
- Cite autores e marque `evidencia`: `consolidado`, `com-bom-suporte` ou `popular-mas-debatido`. Seja honesto sobre os debates.
- Não invente estudos, números ou títulos de livros. Na dúvida, cite menos.
- A tela "Quando buscar ajuda" (`app/telas/ajuda.js`) é fixa e precisa estar sempre a um toque.

## Nova lição
1. Crie `conteudo/trilhas/<pasta>/<NN-nome>.md` no formato descrito no topo de `ferramentas/montar-conteudo.mjs`.
   Use de 3 a 5 sinais e de 1 a 3 perguntas. O texto deve ter de 5 a 10 minutos de leitura (a duração é calculada sozinha).
2. Rode `node ferramentas/montar-conteudo.mjs`. Ele valida tudo e gera `dados/conteudo.json` (commite os dois).

## Código
- Sem framework e sem build: módulos ES em `app/`. Os dados pessoais passam só por `app/dados.js` (IndexedDB), e a interface não acessa o banco direto.
- Arquivo novo em `app/`: acrescente em `ESSENCIAIS` no `sw.js` (senão não funciona offline).
- Nada de analytics, CDNs ou chamadas externas no app. Tudo local.
- Antes do commit: `node ferramentas/testar.mjs` (Playwright já vem instalado no ambiente).

## Áudio (fase 2)
- Mesmo modelo da Jornada: o roteiro (`# Narração`) é gerado uma única vez em `audio/<hash>.mp3`, e o hash considera roteiro, voz e ajustes. Só gera o que for novo ou tiver mudado. Antes de gerar em lote, mostrar a estimativa de caracteres.
- A chave fica em `.env` (`ELEVENLABS_API_KEY`) e nunca é commitada. No ambiente da nuvem, o proxy injeta a chave para api.elevenlabs.io.
- O `voice_id` escolhido fica em `config/voz.json` (pode virar a voz da Joy).
