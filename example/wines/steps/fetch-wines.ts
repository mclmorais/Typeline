import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Wine, WineClient } from '../wine-client'

/**
 * Closure-based dependency injection:
 * The outer function accepts the WineClient,
 * the inner defineStep returns a StepFactory.
 */
export const FetchWinesStep = (client: WineClient) => defineStep(
    (keys: { wines: TypedKey<Wine[]> }) => ({
        name: "Fetch Wines",
        requires: [],
        provides: [keys.wines],
        run: async (store) => {
            const wines = await client.fetchReds()
            store.set(keys.wines, wines)
            console.log(`  🍷 Fetched ${wines.length} red wines`)
        }
    })
)
