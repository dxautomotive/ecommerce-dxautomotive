import { HttpTypes } from "@medusajs/types"
import repeat from "@lib/util/repeat"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-brand-muted text-xs uppercase tracking-wider border-b border-brand-border">
            <th className="text-left py-3 pr-3" colSpan={2}>
              Item
            </th>
            <th className="text-center py-3 px-2">Quantidade</th>
            <th className="hidden small:table-cell text-right py-3 px-2">
              Preço unit.
            </th>
            <th className="text-right py-3 pl-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items
            ? items
                .slice()
                .sort((a, b) =>
                  (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                )
                .map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code}
                  />
                ))
            : repeat(3).map((i) => <SkeletonLineItem key={i} />)}
        </tbody>
      </table>
    </div>
  )
}

export default ItemsTemplate
