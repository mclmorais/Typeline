import type { TypedKey } from '../typeline'
import { defineStep } from '../typeline'

export const SetValueStep = defineStep(
    (keys: { value: TypedKey<string> }) => ({
        name: "Set Value Step",
        requires: [],
        run: (store) => {
            store.set(keys.value, "some value")
            console.log("Value set")
        }
    })
)
