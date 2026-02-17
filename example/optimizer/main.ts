import { createPipeline, optimize } from '../../typeline'
import { keys } from './keys'
import { FetchUserStep } from './steps/fetch-user'
import { FetchOrdersStep } from './steps/fetch-orders'
import { FetchPreferencesStep } from './steps/fetch-preferences'
import { GenerateReportStep } from './steps/generate-report'

/*
 * Unoptimized pipeline — all steps run sequentially:
 *
 *   1. FetchUser         provides: [user]
 *   2. FetchOrders       requires: [user], provides: [orders]
 *   3. FetchPreferences  requires: [user], provides: [preferences]
 *   4. GenerateReport    requires: [user, orders, preferences]
 *
 * But FetchOrders and FetchPreferences both only need [user],
 * so they can run in parallel!
 */

const unoptimized = [
    FetchUserStep,
    FetchOrdersStep,
    FetchPreferencesStep,
    GenerateReportStep,
]

console.log("⚡ Pipeline Optimizer Demo\n")

// Run the optimizer
const optimized = optimize(keys, unoptimized)

// Run the unoptimized version
console.log("--- Unoptimized (sequential) ---\n")
const { runPipeline: runSeq } = createPipeline(keys)
const seqStart = performance.now()
await runSeq(unoptimized)
const seqTime = performance.now() - seqStart
console.log(`\n⏱  Sequential: ${seqTime.toFixed(0)}ms`)

// Run the optimized version
console.log("\n--- Optimized (auto-parallelized) ---\n")
const { runPipeline: runOpt } = createPipeline(keys)
const optStart = performance.now()
await runOpt(optimized)
const optTime = performance.now() - optStart
console.log(`\n⏱  Optimized: ${optTime.toFixed(0)}ms`)

console.log(`\n🚀 Saved ${(seqTime - optTime).toFixed(0)}ms (${((1 - optTime / seqTime) * 100).toFixed(0)}% faster)`)
