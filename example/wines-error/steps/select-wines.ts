import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Wine } from '../wine-client'

export const SelectWinesStep = defineStep(
    (keys: { wines: TypedKey<Wine[]>, selection: TypedKey<Wine[]> }) => ({
        name: "Select Random Wines",
        requires: [keys.wines],
        provides: [keys.selection],
        run: (store) => {
            const wines = store.require(keys.wines)
            const shuffled = [...wines].sort(() => Math.random() - 0.5)
            const selection = shuffled.slice(0, 5)
            store.set(keys.selection, selection)
            console.log(`  🎲 Selected ${selection.length} random wines`)
        }
    })
)
