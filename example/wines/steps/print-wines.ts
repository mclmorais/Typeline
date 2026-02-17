import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Wine } from '../wine-client'

export const PrintWinesStep = defineStep(
    (keys: { selection: TypedKey<Wine[]> }) => ({
        name: "Print Wines",
        requires: [keys.selection],
        run: (store) => {
            const wines = store.require(keys.selection)
            console.log("\n  🍷 Today's Wine Selection")
            console.log("  ════════════════════════════════════════════")
            for (const wine of wines) {
                const rating = wine.rating.average ? `★ ${wine.rating.average}` : 'unrated'
                console.log(`  ${wine.wine}`)
                console.log(`     ${wine.winery} · ${wine.location.replaceAll('\n', ' ')} · ${rating} (${wine.rating.reviews})`)
                console.log()
            }
        }
    })
)
