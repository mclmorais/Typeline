import { createPipeline, parallel } from './typeline'
import { SetValueStep } from './steps/set-value'
import { GetValueStep } from './steps/get-value'

const { runPipeline } = createPipeline()

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