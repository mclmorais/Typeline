import { createPipeline, PipelineError } from '../../typeline'
import { keys } from './keys'
import { WineClient } from './wine-client'
import { FetchWinesStep } from './steps/fetch-wines'
import { SelectWinesStep } from './steps/select-wines'

/*
 * Error Aggregation Demo
 *
 * This pipeline uses a WRONG URL to deliberately trigger an error.
 * The PipelineError captures:
 *   - Which step failed
 *   - The full error chain (PipelineError → HTTP Error)
 *   - The store state at the time of failure
 */

const client = new WineClient("https://api.sampleapis.com/wrong-path")

const { runPipeline } = createPipeline(keys)

console.log("💥 Error Aggregation Demo\n")

try {
    await runPipeline([
        FetchWinesStep(client),
        SelectWinesStep,
    ])
} catch (error) {
    if (error instanceof PipelineError) {
        console.log(error.format())
    } else {
        console.error(error)
    }
}
