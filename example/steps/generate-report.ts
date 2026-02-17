import type { TypedKey } from '../../typeline'
import { defineStep } from '../../typeline'
import type { User, Order, Preferences, Report } from '../keys'
import { delay } from '../utils'

export const GenerateReportStep = defineStep(
    (keys: {
        user: TypedKey<User>,
        orders: TypedKey<Order[]>,
        preferences: TypedKey<Preferences>,
        report: TypedKey<Report>
    }) => ({
        name: "Generate Report",
        requires: [keys.user, keys.orders, keys.preferences],
        run: async (store) => {
            const user = store.require(keys.user)
            const orders = store.require(keys.orders)
            const preferences = store.require(keys.preferences)

            await delay(200)

            const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0)

            store.set(keys.report, {
                userName: user.name,
                totalSpent,
                orderCount: orders.length,
                preferredTheme: preferences.theme,
            })
        }
    })
)
