import { Metadata } from "next"
import PolicyPage from "@modules/policies/components/policy-page"

export const metadata: Metadata = {
  title: "Prazo de entrega",
  description:
    "Modalidades de envio, prazos por região e o que fazer em caso de extravio.",
}

export default function EntregaPage() {
  return (
    <PolicyPage
      title="Prazo de entrega"
      intro="Trabalhamos com os Correios para entregar em todo o Brasil. O prazo de entrega é a soma do prazo de despacho mais o prazo de transporte."
      updatedAt="04/05/2026"
    >
      <h2>Despacho</h2>
      <p>
        Pedidos pagos por <strong>Pix</strong> são despachados no mesmo dia
        (até 14h) ou no próximo dia útil. Pedidos pagos por{" "}
        <strong>cartão de crédito</strong> são despachados após a aprovação
        antifraude (geralmente em até 24h). Pedidos pagos por{" "}
        <strong>boleto</strong> são despachados após a confirmação do pagamento
        pelo banco (1 a 3 dias úteis).
      </p>

      <h2>Modalidades de envio</h2>
      <ul>
        <li>
          <strong>SEDEX:</strong> entrega expressa, prazo entre 2 e 7 dias úteis
          dependendo da região.
        </li>
        <li>
          <strong>PAC:</strong> entrega econômica, prazo entre 5 e 14 dias úteis
          dependendo da região.
        </li>
        <li>
          <strong>Frete grátis:</strong> em compras acima do valor mínimo
          informado no carrinho. Disponível para o Brasil todo via PAC.
        </li>
      </ul>

      <h2>Prazos médios por região</h2>
      <p>Considerando o despacho a partir do nosso centro logístico em Toledo/PR:</p>
      <ul>
        <li>
          <strong>Sul:</strong> SEDEX 2–3 dias úteis · PAC 5–8 dias úteis
        </li>
        <li>
          <strong>Sudeste:</strong> SEDEX 3–4 dias úteis · PAC 5–9 dias úteis
        </li>
        <li>
          <strong>Centro-Oeste:</strong> SEDEX 4–6 dias úteis · PAC 7–12 dias úteis
        </li>
        <li>
          <strong>Nordeste:</strong> SEDEX 5–7 dias úteis · PAC 8–14 dias úteis
        </li>
        <li>
          <strong>Norte:</strong> SEDEX 7–10 dias úteis · PAC 12–20 dias úteis
        </li>
      </ul>

      <h2>Acompanhamento</h2>
      <p>
        Assim que o pedido é postado, enviamos por e-mail e WhatsApp o{" "}
        <strong>código de rastreio</strong> dos Correios. Você acompanha o
        andamento em{" "}
        <a
          href="https://rastreamento.correios.com.br/app/index.php"
          target="_blank"
          rel="noopener noreferrer"
        >
          rastreamento.correios.com.br
        </a>{" "}
        ou direto na sua conta na nossa loja.
      </p>

      <h2>Em caso de atraso, extravio ou objeto avariado</h2>
      <ol>
        <li>
          Verifique o status no rastreio dos Correios. Se estiver "em trânsito"
          há mais de 5 dias úteis sem atualização, ou marcado como "objeto
          extraviado" / "objeto avariado", fale conosco.
        </li>
        <li>
          Abrimos a reclamação junto aos Correios em até 1 dia útil e
          acompanhamos a resolução.
        </li>
        <li>
          Confirmado o extravio, enviamos uma <strong>nova unidade</strong> sem
          custo (sujeito a estoque) ou reembolsamos integralmente.
        </li>
      </ol>

      <h2>Recebimento</h2>
      <ul>
        <li>
          Confira o produto na frente do entregador antes de assinar. Caixa
          violada ou amassada deve ser registrada na canhota e fotografada.
        </li>
        <li>
          Se ninguém estiver disponível para receber, os Correios deixam aviso
          para retirada na agência mais próxima dentro de 7 dias.
        </li>
      </ul>
    </PolicyPage>
  )
}
