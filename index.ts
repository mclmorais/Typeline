import { createPipeline, createKey, parallel } from './typeline'
import { SetValueStep } from './steps/set-value'
import { GetValueStep } from './steps/get-value'
import { keys } from './keys'

const { runPipeline } = createPipeline()

// Correct order — passes validation
console.log("=== Correct order ===")
await runPipeline([SetValueStep(keys), GetValueStep(keys)])

// Wrong order — throws because "value" key hasn't been set yet
console.log("\n=== Wrong order ===")
try {
    await runPipeline([GetValueStep(keys), SetValueStep(keys)])
} catch (e) {
    console.error((e as Error).message)
}

// Parallel execution
console.log("\n=== Parallel ===")
await runPipeline([
    SetValueStep(keys),
    parallel([GetValueStep(keys), GetValueStep(keys)])
])

// Reuse with a different keys object
console.log("\n=== Reuse with different keys ===")
const otherKeys = {
    value: createKey<string>("other_value"),
    extra: createKey<number>("extra"),
}
await runPipeline([SetValueStep(otherKeys), GetValueStep(otherKeys)])