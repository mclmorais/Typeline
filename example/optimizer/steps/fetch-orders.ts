import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User, Orders } from '../keys'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const FetchOrdersStep = defineStep(
    (keys: { user: TypedKey<User>, orders: TypedKey<Orders> }) => ({
        name: "Fetch Orders",
        requires: [keys.user],
        provides: [keys.orders],
        run: async (store) => {
            await delay(300)
            store.set(keys.orders, { count: 5, total: 299.97 })
            console.log("  ✓ Fetched orders")
        }
    })
)
