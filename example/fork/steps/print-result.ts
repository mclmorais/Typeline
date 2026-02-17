import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'

export const PrintResultStep = defineStep(
    (keys: { result: TypedKey<string> }) => ({
        name: "Print Result",
        requires: [keys.result],
        run: (store) => {
            const result = store.require(keys.result)
            console.log(`\n  ✅ Result: ${result}`)
        }
    })
)
