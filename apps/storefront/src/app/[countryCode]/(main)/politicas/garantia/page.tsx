import { Metadata } from "next"
import PolicyPage from "@modules/policies/components/policy-page"

export const metadata: Metadata = {
  title: "Garantia",
  description:
    "Termos de garantia da DX Automotive — cobertura, prazos e como acionar.",
}

export default function GarantiaPage() {
  return (
    <PolicyPage
      title="Garantia"
      intro="Todos os produtos vendidos na DX Automotive contam com a garantia legal de 90 dias prevista no Código de Defesa do Consumidor, somada à garantia contratual de fábrica oferecida pelo fabricante de cada item."
      updatedAt="04/05/2026"
    >
      <h2>Prazos de garantia</h2>
      <ul>
        <li>
          <strong>Garantia legal (CDC):</strong> 90 dias contados da data de
          recebimento do produto, para defeitos aparentes de qualidade,
          quantidade ou funcionamento.
        </li>
        <li>
          <strong>Garantia contratual:</strong> 12 meses contra defeitos de
          fabricação, somada à garantia legal. Em alguns produtos pode haver
          extensão pelo fabricante — verifique a descrição na página do produto.
        </li>
      </ul>

      <h2>O que está coberto</h2>
      <ul>
        <li>Defeitos de fabricação que comprometam o funcionamento normal.</li>
        <li>Componentes eletrônicos que apresentem falha sem indício de mau uso.</li>
        <li>Diferença entre o produto recebido e o anunciado no site.</li>
      </ul>

      <h2>O que NÃO está coberto</h2>
      <ul>
        <li>Danos por mau uso, queda, oxidação ou exposição a líquidos.</li>
        <li>
          Instalação realizada por terceiros sem qualificação, gerando dano ao
          produto ou ao veículo.
        </li>
        <li>
          Componentes desgastados naturalmente pelo uso (cabos, conectores,
          parafusos de fixação).
        </li>
        <li>Tentativas de reparo ou abertura do produto por terceiros não autorizados.</li>
      </ul>

      <h2>Como acionar a garantia</h2>
      <ol>
        <li>
          Entre em contato pelo nosso WhatsApp informando o número do pedido,
          descrição do problema e fotos/vídeos do defeito.
        </li>
        <li>
          Nossa equipe técnica avalia o caso em até <strong>3 dias úteis</strong>{" "}
          e abre o RMA com o fabricante quando necessário.
        </li>
        <li>
          Aprovada a devolução, enviamos um código de postagem dos Correios sem
          custo para você. O produto é avaliado em <strong>até 10 dias úteis</strong>{" "}
          após chegar em nosso centro técnico.
        </li>
        <li>
          Confirmado o defeito coberto, fazemos a substituição por um item novo
          ou a devolução do valor pago, à sua escolha.
        </li>
      </ol>

      <h2>Importante</h2>
      <p>
        Guarde a embalagem original e a nota fiscal pelo menos durante o período
        de garantia. Esses documentos agilizam o acionamento e evitam recusa por
        parte do fabricante.
      </p>
    </PolicyPage>
  )
}
