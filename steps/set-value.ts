import type { Step } from '../typeline'
import { keys } from '../keys'

export const SetValueStep: Step = {
    name: "Set Value Step",
    run: (store) => {
        store.set(keys.value, "some value")
        console.log("Value set")
    }
}
