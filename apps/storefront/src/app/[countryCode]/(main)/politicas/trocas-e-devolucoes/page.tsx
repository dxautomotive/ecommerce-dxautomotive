import { Metadata } from "next"
import PolicyPage from "@modules/policies/components/policy-page"

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description:
    "Direito de arrependimento, troca por defeito e processo de devolução na DX Automotive.",
}

export default function TrocasDevolucoesPage() {
  return (
    <PolicyPage
      title="Trocas e devoluções"
      intro="Você tem direito a se arrepender da compra, trocar por defeito ou receber o valor de volta dentro dos prazos definidos no Código de Defesa do Consumidor."
      updatedAt="04/05/2026"
    >
      <h2>Arrependimento de compra (CDC art. 49)</h2>
      <p>
        Por se tratar de uma compra fora do estabelecimento físico, você tem{" "}
        <strong>até 7 dias corridos</strong> a partir do recebimento do produto
        para se arrepender e cancelar a compra, sem precisar justificar.
      </p>
      <ul>
        <li>O produto deve estar lacrado, sem uso e sem sinais de instalação.</li>
        <li>A embalagem original e todos os acessórios precisam ser devolvidos.</li>
        <li>O custo do frete de devolução é por nossa conta.</li>
        <li>
          O reembolso é feito pela mesma forma de pagamento usada na compra,
          em <strong>até 7 dias úteis</strong> após o produto chegar em nosso
          centro de logística.
        </li>
      </ul>

      <h2>Troca por defeito</h2>
      <p>
        Se o produto chegou com defeito de fabricação, você pode acionar a troca
        em até <strong>90 dias</strong> (garantia legal) ou no prazo da garantia
        contratual do fabricante, o que for maior.
      </p>
      <ol>
        <li>Abra a solicitação pelo nosso WhatsApp anexando fotos/vídeos.</li>
        <li>
          Nosso suporte avalia o caso em até 3 dias úteis e envia código de
          postagem dos Correios sem custo.
        </li>
        <li>
          Após receber e validar o defeito (até 10 dias úteis), enviamos um item
          novo idêntico. Se não houver estoque, oferecemos troca por outro
          produto de valor equivalente ou reembolso integral.
        </li>
      </ol>

      <h2>Troca por divergência ou erro de envio</h2>
      <p>
        Se você recebeu um produto diferente do que comprou, ou faltou
        item/acessório, fale conosco em até 48h após o recebimento. A correção é
        feita sem custo adicional.
      </p>

      <h2>Quando a troca não se aplica</h2>
      <ul>
        <li>Produtos com sinais claros de uso, instalação ou tentativa de instalação.</li>
        <li>Produtos sem a embalagem original ou sem acessórios.</li>
        <li>
          Itens personalizados (gravação, customização específica) — esses são
          analisados caso a caso.
        </li>
        <li>Reclamações fora do prazo legal (90 dias da garantia legal).</li>
      </ul>

      <h2>Reembolso</h2>
      <ul>
        <li>
          <strong>Pix:</strong> devolvido em até 2 dias úteis na chave Pix
          informada.
        </li>
        <li>
          <strong>Boleto:</strong> devolvido em até 5 dias úteis por Pix ou TED
          (você escolhe).
        </li>
        <li>
          <strong>Cartão de crédito:</strong> estornado pela operadora —
          aparece em até 2 faturas, conforme regra de cada banco.
        </li>
      </ul>
    </PolicyPage>
  )
}
