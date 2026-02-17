import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User, Preferences } from '../keys'
import { delay } from '../utils'

export const FetchPreferencesStep = defineStep(
    (keys: { user: TypedKey<User>, preferences: TypedKey<Preferences> }) => ({
        name: "Fetch Preferences",
        requires: [keys.user],
        run: async (store) => {
            const user = store.require(keys.user)
            await delay(400)
            store.set(keys.preferences, {
                theme: 'dark',
                notifications: true,
                language: 'pt-BR',
            })
            console.log(`  Loaded preferences for ${user.name}`)
        }
    })
)
