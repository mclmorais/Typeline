import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Role } from '../keys'

export const MemberStep = defineStep(
    (keys: { role: TypedKey<Role>, result: TypedKey<string> }) => ({
        name: "Member Access",
        requires: [keys.role],
        run: (store) => {
            console.log("  👤 Granting standard member access")
            store.set(keys.result, "Standard member access granted")
        }
    })
)
