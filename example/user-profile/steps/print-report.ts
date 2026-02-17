import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Report } from '../keys'

export const PrintReportStep = defineStep(
    (keys: { report: TypedKey<Report> }) => ({
        name: "Print Report",
        requires: [keys.report],
        run: (store) => {
            const report = store.require(keys.report)
            console.log("\n📋 User Profile Report")
            console.log("──────────────────────")
            console.log(`  Name:       ${report.userName}`)
            console.log(`  Orders:     ${report.orderCount}`)
            console.log(`  Total Spent: $${report.totalSpent.toFixed(2)}`)
            console.log(`  Theme:      ${report.preferredTheme}`)
            console.log("──────────────────────")
        }
    })
)
