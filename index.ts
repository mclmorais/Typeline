import { createPipeline, createKey, parallel } from './typeline'
import { SetValueStep } from './steps/set-value'
import { GetValueStep } from './steps/get-value'
import { keys } from './keys'

const { runPipeline } = createPipeline(keys)

// Correct order — passes validation
console.log("=== Correct order ===")
await runPipeline([SetValueStep, GetValueStep])

// Wrong order — throws because "value" key hasn't been set yet
console.log("\n=== Wrong order ===")
try {
    await runPipeline([GetValueStep, SetValueStep])
} catch (e) {
    console.error((e as Error).message)
}

// Parallel execution
console.log("\n=== Parallel ===")
await runPipeline([
    SetValueStep,
    parallel([GetValueStep, GetValueStep])
])

// Reuse with a different keys object
console.log("\n=== Reuse with different keys ===")
const otherKeys = {
    value: createKey<string>("other_value"),
}
const { runPipeline: runOtherPipeline } = createPipeline(otherKeys)
await runOtherPipeline([SetValueStep, GetValueStep])