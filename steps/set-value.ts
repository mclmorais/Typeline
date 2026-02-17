import type { Step } from '../typeline'
import { valueKey } from '../keys'

export const SetValueStep: Step = {
    name: "Set Value Step",
    run: (store) => {
        store.set(valueKey, "some value")
        console.log("Value set")
    }
}
