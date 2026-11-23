// Ajustes: backup (exportar/importar), estado do armazenamento e privacidade.
import * as dados from "../dados.js";
import { aviso, cabecalhoVoltar, icone } from "../ui.js";

export async function telaAjustes() {
  const estado = await dados.estadoArmazenamento();
  const persistencia = estado.persistente === true
    ? "Protegidos: o navegador não deve apagar seus dados para liberar espaço."
    : estado.persistente === false
      ? "O navegador ainda não garantiu que vai manter seus dados. Instalar o app na tela inicial e fazer backups de vez em quando ajuda."
      : "Não foi possível verificar.";
  const uso = estado.usadoMB != null ? `${estado.usadoMB < 1 ? "menos de 1" : estado.usadoMB.toFixed(1)} MB usados neste dispositivo.` : "";

  return {
    titulo: "Ajustes",
    html: `${cabecalhoVoltar("#/", "Início")}
      <header class="topo-tela"><h1>Ajustes</h1></header>

      <section class="cartao">
        <h2>${icone("cadeado")} Seus dados</h2>
        <p>Tudo o que você escreve (reflexões, diário, check-ins) fica <strong>só neste dispositivo</strong>. Não há conta, nuvem, analytics nem rastreamento.</p>
        <p class="pequeno">${persistencia} ${uso}</p>
      </section>

      <section class="cartao">
        <h2>Backup</h2>
        <p>Como os dados só existem aqui, faça um backup de vez em quando e guarde o arquivo num lugar seguro. Ele também serve para levar seus dados para outro aparelho.</p>
        <div class="botoes">
          <button class="botao" data-exportar>Exportar backup</button>
          <label class="botao secundario">Importar backup<input type="file" accept="application/json,.json" data-importar hidden></label>
        </div>
        <p class="pequeno">Importar substitui todos os dados atuais pelos do arquivo.</p>
      </section>

      <section class="cartao">
        <h2>Apagar tudo</h2>
        <p>Remove todas as suas reflexões, registros e progresso deste dispositivo. Não dá para desfazer.</p>
        <button class="botao perigo" data-apagar>Apagar meus dados</button>
      </section>`,
    depois(el) {
      el.querySelector("[data-exportar]").addEventListener("click", async () => {
        const backup = await dados.exportar();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bussola-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        aviso("Backup exportado.");
      });

      el.querySelector("[data-importar]").addEventListener("change", async (ev) => {
        const arquivo = ev.target.files[0];
        ev.target.value = "";
        if (!arquivo) return;
        try {
          const obj = JSON.parse(await arquivo.text());
          dados.validarBackup(obj);
          const total = Object.values(obj.dados).reduce((n, r) => n + (Array.isArray(r) ? r.length : 0), 0);
          if (!confirm(`Importar ${total} registros de ${new Date(obj.exportadoEm).toLocaleDateString("pt-BR")}? Os dados atuais serão substituídos.`)) return;
          await dados.importar(obj);
          aviso("Backup importado.");
        } catch (e) {
          alert(e instanceof SyntaxError ? "O arquivo não é um JSON válido." : e.message);
        }
      });

      el.querySelector("[data-apagar]").addEventListener("click", async () => {
        if (!confirm("Apagar todos os seus dados deste dispositivo?")) return;
        if (!confirm("Tem certeza? Isso não pode ser desfeito. Se quiser, exporte um backup antes.")) return;
        await dados.apagarTudo();
        aviso("Dados apagados.");
      });
    }
  };
}
