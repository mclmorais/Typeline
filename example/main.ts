import { createPipeline, parallel } from '../typeline'
import { keys } from './keys'
import { FetchUserStep } from './steps/fetch-user'
import { FetchOrdersStep } from './steps/fetch-orders'
import { FetchPreferencesStep } from './steps/fetch-preferences'
import { GenerateReportStep } from './steps/generate-report'
import { PrintReportStep } from './steps/print-report'

const { runPipeline } = createPipeline()

/*
 * Pipeline: User Profile Enrichment
 *
 * 1. Fetch user          (~300ms)
 * 2. In parallel:
 *    - Fetch orders      (~500ms)
 *    - Fetch preferences (~400ms)
 * 3. Generate report     (~200ms)
 * 4. Print report        (sync)
 *
 * Total sequential: ~300 + ~500 + ~200 = ~1000ms
 * Total with parallel: ~300 + ~500 + ~200 = ~1000ms (but step 2 saves ~400ms)
 */

console.log("🚀 Starting User Profile Enrichment Pipeline\n")
const start = performance.now()

await runPipeline([
    FetchUserStep(keys),
    parallel([
        FetchOrdersStep(keys),
        FetchPreferencesStep(keys),
    ]),
    GenerateReportStep(keys),
    PrintReportStep(keys),
])

const elapsed = performance.now() - start
console.log(`\n⏱  Pipeline completed in ${elapsed.toFixed(0)}ms`)
