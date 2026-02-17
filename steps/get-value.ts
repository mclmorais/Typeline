import type { Step } from '../typeline'
import { valueKey } from '../keys'

export const GetValueStep: Step = {
    name: "Get Value Step",
    requires: [valueKey],
    run: (store) => {
        const value = store.get(valueKey)
        console.log("Value: ", value)
    }
}
