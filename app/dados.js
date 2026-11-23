// Dados pessoais, guardados só neste dispositivo (IndexedDB).
// Nada aqui sai do aparelho, a não ser pelo backup que você mesmo exporta.
// Este módulo não conhece a interface: pode ser reaproveitado pela Joy.

const NOME_BANCO = "bussola";
const VERSAO_BANCO = 1;

// Todas as "gavetas" do app, já criadas desde a primeira versão para o formato ficar estável.
export const LOJAS = {
  progresso: "licaoId",        // { licaoId, trilhaId, abertaEm, concluidaEm, audio: { posicao } }
  diario: "id",                // { id, criadoEm, texto, tags: [], origem?: { tipo, licaoId, pergunta } }
  checkins: "data",            // { data: "AAAA-MM-DD", humor, energia, estimulo, social, nota }
  apostas: "id",               // pilar Praticar (fase 4)
  identificacoes: "conceitoId",// pilar Descobrir (fase 4)
  ajustes: "chave"             // { chave, valor }
};

let conexao = null;

function abrir() {
  if (conexao) return conexao;
  conexao = new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_BANCO, VERSAO_BANCO);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      for (const [loja, chave] of Object.entries(LOJAS)) {
        if (!db.objectStoreNames.contains(loja)) db.createObjectStore(loja, { keyPath: chave });
      }
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
  return conexao;
}

function esperar(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loja(nome, modo = "readonly") {
  const db = await abrir();
  return db.transaction(nome, modo).objectStore(nome);
}

export async function obter(nome, chave) {
  return esperar((await loja(nome)).get(chave));
}

export async function listar(nome) {
  return esperar((await loja(nome)).getAll());
}

export async function salvar(nome, registro) {
  await esperar((await loja(nome, "readwrite")).put(registro));
  pedirPersistencia();
  return registro;
}

export async function apagar(nome, chave) {
  return esperar((await loja(nome, "readwrite")).delete(chave));
}

export function novoId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Pede ao navegador para não apagar os dados quando faltar espaço (importante no iPhone).
let persistenciaPedida = false;
export async function pedirPersistencia() {
  if (persistenciaPedida || !navigator.storage?.persist) return;
  persistenciaPedida = true;
  try { await navigator.storage.persist(); } catch (e) { /* sem suporte: segue o jogo */ }
}

export async function estadoArmazenamento() {
  const estado = { persistente: null, usadoMB: null };
  try {
    if (navigator.storage?.persisted) estado.persistente = await navigator.storage.persisted();
    if (navigator.storage?.estimate) {
      const e = await navigator.storage.estimate();
      estado.usadoMB = e.usage != null ? e.usage / 1024 / 1024 : null;
    }
  } catch (e) { /* ignora */ }
  return estado;
}

// ---------- Backup ----------

export async function exportar() {
  const dados = {};
  for (const nome of Object.keys(LOJAS)) dados[nome] = await listar(nome);
  return { app: "bussola", formato: 1, exportadoEm: new Date().toISOString(), dados };
}

export function validarBackup(obj) {
  if (!obj || obj.app !== "bussola" || typeof obj.dados !== "object") {
    throw new Error("Este arquivo não parece um backup da Bússola.");
  }
  for (const [nome, registros] of Object.entries(obj.dados)) {
    if (!LOJAS[nome]) continue;
    if (!Array.isArray(registros)) throw new Error(`Backup com formato inválido em "${nome}".`);
    for (const r of registros) {
      if (!r || r[LOJAS[nome]] == null) throw new Error(`Registro sem identificação em "${nome}".`);
    }
  }
  return true;
}

// Substitui tudo pelo conteúdo do backup, numa transação só: ou importa tudo, ou nada.
export async function importar(obj) {
  validarBackup(obj);
  const db = await abrir();
  const nomes = Object.keys(LOJAS);
  await new Promise((resolve, reject) => {
    const tx = db.transaction(nomes, "readwrite");
    for (const nome of nomes) {
      const s = tx.objectStore(nome);
      s.clear();
      for (const r of obj.dados[nome] || []) s.put(r);
    }
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Importação cancelada."));
  });
  pedirPersistencia();
}

export async function apagarTudo() {
  const db = await abrir();
  const nomes = Object.keys(LOJAS);
  await new Promise((resolve, reject) => {
    const tx = db.transaction(nomes, "readwrite");
    for (const nome of nomes) tx.objectStore(nome).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Atalhos usados pelas telas ----------

export async function registrarAbertura(licao) {
  const atual = (await obter("progresso", licao.id)) || { licaoId: licao.id, trilhaId: licao.trilha };
  atual.abertaEm = new Date().toISOString();
  return salvar("progresso", atual);
}

export async function marcarConcluida(licao, concluida) {
  const atual = (await obter("progresso", licao.id)) || { licaoId: licao.id, trilhaId: licao.trilha };
  atual.concluidaEm = concluida ? new Date().toISOString() : null;
  return salvar("progresso", atual);
}

export async function reflexoesDaLicao(licaoId) {
  const todas = await listar("diario");
  return todas
    .filter((e) => e.origem?.tipo === "licao" && e.origem.licaoId === licaoId)
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
}

export async function salvarReflexao(licao, pergunta, texto) {
  return salvar("diario", {
    id: novoId(),
    criadoEm: new Date().toISOString(),
    texto,
    tags: ["reflexão"],
    origem: { tipo: "licao", licaoId: licao.id, trilhaId: licao.trilha, pergunta }
  });
}
