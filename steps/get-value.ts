import type { Step } from '../typeline'
import { keys } from '../keys'

export const GetValueStep: Step = {
    name: "Get Value Step",
    requires: [keys.value],
    run: (store) => {
        const value = store.get(keys.value)
        console.log("Value: ", value)
    }
}
