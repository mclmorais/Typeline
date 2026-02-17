import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User } from '../keys'
import { delay } from '../utils'

export const FetchUserStep = defineStep(
    (keys: { user: TypedKey<User> }) => ({
        name: "Fetch User",
        requires: [],
        run: async (store) => {
            await delay(300)
            store.set(keys.user, {
                id: "usr_42",
                name: "Marcelo",
                email: "marcelo@example.com"
            })
        }
    })
)
