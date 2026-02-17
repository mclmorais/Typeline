import type { TypedKey } from '../typeline'
import { defineStep } from '../typeline'

export const GetValueStep = defineStep(
    (keys: { value: TypedKey<string> }) => ({
        name: "Get Value Step",
        requires: [keys.value],
        run: (store) => {
            const value = store.get(keys.value)
            console.log("Value: ", value)
        }
    })
)
