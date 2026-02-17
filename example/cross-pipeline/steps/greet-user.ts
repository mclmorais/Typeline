import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User } from '../../user-profile/keys'

export const GreetUserStep = defineStep(
    (keys: { user: TypedKey<User>, greeting: TypedKey<string> }) => ({
        name: "Greet User",
        requires: [keys.user],
        run: (store) => {
            const user = store.require(keys.user)
            const message = `Hello, ${user.name} (${user.email})! Welcome back.`
            store.set(keys.greeting, message)
            console.log(`  ${message}`)
        }
    })
)
