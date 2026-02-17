import { createPipeline, fork, type TypedMap } from '../../typeline'
import { keys } from './keys'
import { AssignRoleStep } from './steps/assign-role'
import { AdminStep } from './steps/admin-step'
import { MemberStep } from './steps/member-step'
import { PrintResultStep } from './steps/print-result'

const { runPipeline } = createPipeline(keys)

/*
 * Pipeline: Role-Based Access
 *
 * 1. Assign a role (randomly: admin or member)
 * 2. Fork based on role:
 *    - admin  → AdminStep (grants admin dashboard access)
 *    - member → MemberStep (grants standard member access)
 * 3. Print the result (runs after either branch)
 */

console.log("🔀 Fork Example — Role-Based Access\n")

await runPipeline([
    AssignRoleStep,
    fork(
        (store: TypedMap) => store.require(keys.role) === 'admin',
        [AdminStep],   // true branch — admin
        [MemberStep],  // false branch — member
    ),
    PrintResultStep,
])
