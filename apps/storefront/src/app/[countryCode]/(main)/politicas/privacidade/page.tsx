import { Metadata } from "next"
import PolicyPage from "@modules/policies/components/policy-page"

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a DX Automotive coleta, usa e protege seus dados pessoais — em conformidade com a LGPD.",
}

export default function PrivacidadePage() {
  return (
    <PolicyPage
      title="Política de privacidade"
      intro="Esta política descreve como a DX Automotive trata os dados pessoais coletados na loja, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)."
      updatedAt="04/05/2026"
    >
      <h2>1. Quem somos</h2>
      <p>
        A DX Automotive é uma loja online do <strong>Grupo Dr. Farol Toledo</strong>,
        sediado em Toledo/PR. Quando você compra ou se cadastra na nossa loja,
        somos o <strong>controlador</strong> dos seus dados pessoais.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <h3>Dados que você fornece</h3>
      <ul>
        <li>
          <strong>Cadastro:</strong> nome, e-mail, telefone, CPF, data de nascimento.
        </li>
        <li>
          <strong>Compra:</strong> endereço de entrega e cobrança, dados de
          pagamento (processados de forma criptografada pela operadora — não
          guardamos número completo de cartão).
        </li>
        <li>
          <strong>Comunicação:</strong> mensagens trocadas pelo WhatsApp, chat
          ou e-mail.
        </li>
      </ul>
      <h3>Dados coletados automaticamente</h3>
      <ul>
        <li>Endereço IP, navegador, sistema operacional, dispositivo.</li>
        <li>
          Páginas visitadas, produtos visualizados e comportamento na loja
          (cookies — você pode gerenciá-los pelo navegador).
        </li>
      </ul>

      <h2>3. Para que usamos esses dados</h2>
      <ul>
        <li>Processar e entregar seus pedidos.</li>
        <li>
          Cumprir obrigações legais e fiscais (emissão de nota fiscal, registros
          contábeis).
        </li>
        <li>Enviar atualizações do pedido por e-mail e WhatsApp.</li>
        <li>
          Marketing e ofertas (somente com seu consentimento, ao se cadastrar
          na newsletter).
        </li>
        <li>
          Prevenção a fraudes e segurança da loja (análise antifraude no
          checkout, junto com o gateway de pagamento).
        </li>
        <li>Melhorar a experiência da loja com base em dados agregados.</li>
      </ul>

      <h2>4. Com quem compartilhamos</h2>
      <p>Compartilhamos seus dados apenas com terceiros essenciais à operação:</p>
      <ul>
        <li>
          <strong>Operadoras de pagamento</strong> (ex.: MercadoPago) — para
          processar a transação.
        </li>
        <li>
          <strong>Transportadoras</strong> (Correios, transportadoras parceiras)
          — para entrega.
        </li>
        <li>
          <strong>Provedores de e-mail e WhatsApp</strong> — para comunicação
          transacional.
        </li>
        <li>
          <strong>Hospedagem em nuvem</strong> e ferramentas de análise — sob
          contrato de proteção de dados.
        </li>
        <li>
          <strong>Autoridades públicas</strong> — quando legalmente exigido
          (intimação, ordem judicial).
        </li>
      </ul>
      <p>Nunca vendemos seus dados a terceiros para fins comerciais.</p>

      <h2>5. Por quanto tempo guardamos</h2>
      <ul>
        <li>
          Dados de cadastro: enquanto sua conta estiver ativa.
        </li>
        <li>
          Dados de pedidos: pelo prazo legal de 5 anos após a compra (obrigação
          fiscal).
        </li>
        <li>Logs de acesso: 6 meses (Marco Civil da Internet).</li>
      </ul>

      <h2>6. Seus direitos como titular (LGPD)</h2>
      <p>A qualquer momento, você pode pedir:</p>
      <ul>
        <li>Confirmação de que tratamos seus dados;</li>
        <li>Acesso a uma cópia dos dados que temos sobre você;</li>
        <li>Correção de dados incompletos ou desatualizados;</li>
        <li>
          Anonimização ou eliminação de dados desnecessários (respeitadas as
          obrigações legais);
        </li>
        <li>Portabilidade para outro fornecedor;</li>
        <li>
          Revogação do consentimento (ex.: descadastro da newsletter, sem
          afetar pedidos em andamento);
        </li>
        <li>
          Informação sobre com quem compartilhamos seus dados.
        </li>
      </ul>

      <h2>7. Como exercer seus direitos</h2>
      <p>
        Envie um e-mail para{" "}
        <a href="mailto:privacidade@dxautomotive.com.br">
          privacidade@dxautomotive.com.br
        </a>{" "}
        com seu nome, CPF e o pedido específico. Respondemos em até 15 dias.
      </p>

      <h2>8. Segurança</h2>
      <p>
        Usamos HTTPS/TLS em toda a loja, criptografia de senhas e controle de
        acesso. Pagamentos são tokenizados pela operadora; não armazenamos o
        número completo do cartão.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Usamos cookies essenciais (login, carrinho) e analíticos (estatísticas
        agregadas de uso). Você pode bloqueá-los nas configurações do navegador
        — algumas funcionalidades da loja podem ficar limitadas.
      </p>

      <h2>10. Atualizações desta política</h2>
      <p>
        Podemos atualizar este texto. Versões anteriores ficam disponíveis sob
        solicitação. A data da última atualização é exibida no topo desta
        página.
      </p>
    </PolicyPage>
  )
}
