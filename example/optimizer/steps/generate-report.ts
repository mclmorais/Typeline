import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User, Orders, Preferences, Report } from '../keys'

export const GenerateReportStep = defineStep(
    (keys: {
        user: TypedKey<User>,
        orders: TypedKey<Orders>,
        preferences: TypedKey<Preferences>,
        report: TypedKey<Report>
    }) => ({
        name: "Generate Report",
        requires: [keys.user, keys.orders, keys.preferences],
        provides: [keys.report],
        run: (store) => {
            const user = store.require(keys.user)
            const orders = store.require(keys.orders)
            const prefs = store.require(keys.preferences)
            store.set(keys.report, {
                summary: `${user.name}: ${orders.count} orders ($${orders.total}), theme=${prefs.theme}`
            })
            console.log("  ✓ Generated report")
        }
    })
)
