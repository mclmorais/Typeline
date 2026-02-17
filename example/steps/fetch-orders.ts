import type { TypedKey } from '../../typeline'
import { defineStep } from '../../typeline'
import type { User, Order } from '../keys'
import { delay } from '../utils'

export const FetchOrdersStep = defineStep(
    (keys: { user: TypedKey<User>, orders: TypedKey<Order[]> }) => ({
        name: "Fetch Orders",
        requires: [keys.user],
        run: async (store) => {
            const user = store.get(keys.user)!
            await delay(500)
            store.set(keys.orders, [
                { id: "ord_1", product: "Mechanical Keyboard", amount: 149.99 },
                { id: "ord_2", product: "USB-C Hub", amount: 59.99 },
                { id: "ord_3", product: "Monitor Stand", amount: 89.99 },
            ])
            console.log(`  Fetched ${3} orders for ${user.name}`)
        }
    })
)
