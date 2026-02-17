import type { TypedKey } from '../../../typeline'
import { defineStep } from '../../../typeline'
import type { Role } from '../keys'

export const AssignRoleStep = defineStep(
    (keys: { role: TypedKey<Role> }) => ({
        name: "Assign Role",
        requires: [],
        run: (store) => {
            const role: Role = Math.random() > 0.5 ? 'admin' : 'member'
            store.set(keys.role, role)
            console.log(`  Assigned role: ${role}`)
        }
    })
)
