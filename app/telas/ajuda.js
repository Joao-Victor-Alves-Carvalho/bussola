// Tela fixa "Quando buscar ajuda". Sempre acessível pelo botão no topo.
import { icone } from "../ui.js";

export async function telaAjuda() {
  return {
    titulo: "Quando buscar ajuda",
    html: `<header class="topo-tela"><h1>Quando buscar ajuda</h1>
        <p class="intro">Este app ajuda a se entender, mas tem limite. Se algo estiver pesando além do que ele resolve, você não precisa lidar com isso sozinho.</p></header>

      <section class="cartao urgente">
        <h2>Se você está em perigo agora</h2>
        <p>Se você está pensando em tirar a própria vida ou corre risco imediato, procure ajuda já:</p>
        <div class="botoes-ligar">
          <a class="botao" href="tel:188">${icone("telefone")} Ligar 188 · CVV</a>
          <a class="botao secundario" href="tel:192">${icone("telefone")} Ligar 192 · SAMU</a>
        </div>
        <p class="pequeno">Em risco imediato, você também pode ir a uma UPA ou ao pronto-socorro mais próximo.</p>
      </section>

      <section class="cartao">
        <h2>CVV: Centro de Valorização da Vida</h2>
        <p>Apoio emocional gratuito e sigiloso, 24 horas por dia, com voluntários treinados para ouvir sem julgar. Você não precisa estar em crise para ligar: pode ser só para conversar.</p>
        <ul>
          <li>Telefone: <a href="tel:188"><strong>188</strong></a> (ligação gratuita, de qualquer telefone)</li>
          <li>Chat e e-mail: <a href="https://cvv.org.br" target="_blank" rel="noopener">cvv.org.br</a></li>
        </ul>
      </section>

      <section class="cartao">
        <h2>CAPS: Centro de Atenção Psicossocial</h2>
        <p>Serviço gratuito do SUS para quem passa por sofrimento psíquico intenso ou persistente. Você pode procurar o CAPS da sua região diretamente ou pedir orientação na UBS (posto de saúde) do seu bairro.</p>
      </section>

      <section class="cartao">
        <h2>Psicólogo</h2>
        <p>Para acompanhamento contínuo, a psicoterapia é o caminho mais indicado. Algumas formas de encontrar:</p>
        <ul>
          <li><strong>Clínicas-escola</strong> de faculdades de psicologia costumam oferecer atendimento gratuito ou de baixo custo.</li>
          <li><strong>UBS</strong>: o posto de saúde pode encaminhar para atendimento psicológico pelo SUS.</li>
          <li>Antes de começar, você pode conferir se o profissional tem registro no <a href="https://cadastro.cfp.org.br" target="_blank" rel="noopener">Cadastro Nacional de Psicólogos (CFP)</a>.</li>
        </ul>
      </section>

      <section class="cartao">
        <h2>Sinais de que vale procurar alguém</h2>
        <ul>
          <li>Tristeza, vazio ou ansiedade na maior parte dos dias, por mais de duas semanas.</li>
          <li>Sono ou apetite muito diferentes do seu normal.</li>
          <li>Deixar de fazer coisas importantes porque não consegue.</li>
          <li>Usar álcool ou outras substâncias para aguentar o dia.</li>
          <li>Pensamentos de que seria melhor não existir.</li>
        </ul>
        <p>Buscar ajuda não é sinal de fraqueza. É usar um recurso a mais.</p>
      </section>

      <p class="lembrete">Os números de telefone funcionam mesmo sem internet. Os links precisam de conexão.</p>`
  };
}
