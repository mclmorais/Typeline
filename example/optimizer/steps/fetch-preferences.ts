import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { User, Preferences } from '../keys'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const FetchPreferencesStep = defineStep(
    (keys: { user: TypedKey<User>, preferences: TypedKey<Preferences> }) => ({
        name: "Fetch Preferences",
        requires: [keys.user],
        provides: [keys.preferences],
        run: async (store) => {
            await delay(250)
            store.set(keys.preferences, { theme: "dark", language: "pt-BR" })
            console.log("  ✓ Fetched preferences")
        }
    })
)
