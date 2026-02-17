import { createPipeline } from '../../typeline'
import { keys } from './keys'

// Reusing FetchUserStep from the user-profile example!
// It only requires `{ user: TypedKey<User> }`, which our keys satisfy.
import { FetchUserStep } from '../user-profile/steps/fetch-user'

import { GreetUserStep } from './steps/greet-user'

const { runPipeline } = createPipeline(keys)

/*
 * This pipeline reuses FetchUserStep from the user-profile example.
 *
 * FetchUserStep was defined with:
 *   (keys: { user: TypedKey<User> }) => Step
 *
 * Our keys object has `{ user, greeting }` — which satisfies
 * the `{ user }` requirement via structural typing.
 *
 * This is the power of defineStep: steps declare minimal
 * key requirements and work in any compatible pipeline.
 */

console.log("🔄 Cross-Pipeline Step Reuse Demo\n")

await runPipeline([
    FetchUserStep,   // ← reused from user-profile example
    GreetUserStep,   // ← unique to this pipeline
])
