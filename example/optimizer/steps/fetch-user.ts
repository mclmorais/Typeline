import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User } from '../keys'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const FetchUserStep = defineStep(
    (keys: { user: TypedKey<User> }) => ({
        name: "Fetch User",
        requires: [],
        provides: [keys.user],
        run: async (store) => {
            await delay(200)
            store.set(keys.user, { id: "usr_1", name: "Marcelo" })
            console.log("  ✓ Fetched user")
        }
    })
)
