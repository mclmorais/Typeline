import { createPipeline } from '../../typeline'
import { keys } from './keys'
import { WineClient } from './wine-client'
import { FetchWinesStep } from './steps/fetch-wines'
import { SelectWinesStep } from './steps/select-wines'
import { PrintWinesStep } from './steps/print-wines'

/*
 * Closure-based Dependency Injection
 *
 * The WineClient is injected into FetchWinesStep via closure,
 * not through the pipeline store. This keeps infrastructure
 * concerns separate from pipeline data.
 *
 * FetchWinesStep(client) returns a StepFactory — the client
 * is captured in the closure and used inside the step's run().
 */

const client = new WineClient("https://api.sampleapis.com")

const { runPipeline } = createPipeline(keys)

console.log("🍇 Wine Pipeline — Closure-Based DI\n")

await runPipeline([
    FetchWinesStep(client),  // inject the client via closure
    SelectWinesStep,
    PrintWinesStep,
])
