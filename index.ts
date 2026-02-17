import { createPipeline } from './typeline'
import { SetValueStep } from './steps/set-value'
import { GetValueStep } from './steps/get-value'

const { runPipeline } = createPipeline()

// Correct order — passes validation
console.log("=== Correct order ===")
runPipeline([SetValueStep, GetValueStep])

// Wrong order — throws because "value" key hasn't been set yet
console.log("\n=== Wrong order ===")
try {
    runPipeline([GetValueStep, SetValueStep])
} catch (e) {
    console.error((e as Error).message)
}