import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Role } from '../keys'

export const AdminStep = defineStep(
    (keys: { role: TypedKey<Role>, result: TypedKey<string> }) => ({
        name: "Admin Access",
        requires: [keys.role],
        run: (store) => {
            console.log("  🔑 Granting admin dashboard access")
            store.set(keys.result, "Full admin privileges granted")
        }
    })
)
