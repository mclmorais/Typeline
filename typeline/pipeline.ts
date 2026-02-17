import { AsyncLocalStorage } from 'node:async_hooks'
import type { TypedKey } from './key'
import { TypedMap } from './store'
import type { Step, StepFactory } from './step'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParallelGroupFactory = {
    readonly __parallel: true,
    readonly factories: StepFactory<any>[]
}

export type PipelineEntryFactory<K extends Record<string, TypedKey<unknown>>> = StepFactory<K> | ParallelGroupFactory

export function parallel(
    factories: StepFactory<any>[]
): ParallelGroupFactory {
    return { __parallel: true, factories }
}

function isParallelGroup<K extends Record<string, TypedKey<unknown>>>(
    entry: PipelineEntryFactory<K>
): entry is ParallelGroupFactory {
    return typeof entry === 'object' && '__parallel' in entry
}

function validateStep(step: Step, store: TypedMap): void {
    for (const key of step.requires ?? []) {
        if (!store.has(key)) {
            throw new Error(
                `Step "${step.name}" requires key "${key.name}" but it has not been set. ` +
                `Ensure a preceding step sets this value before this step runs.`
            )
        }
    }
}

export function createPipeline<K extends Record<string, TypedKey<unknown>>>(keys: K) {
    const asyncLocalStorage = new AsyncLocalStorage<TypedMap>()

    const getStore = () => asyncLocalStorage.getStore()

    const runPipeline = (entries: PipelineEntryFactory<K>[]) => {
        return asyncLocalStorage.run(new TypedMap(), async () => {
            const store = asyncLocalStorage.getStore()!
            for (const entry of entries) {
                if (isParallelGroup(entry)) {
                    const steps = entry.factories.map(f => f(keys))
                    for (const step of steps) {
                        validateStep(step, store)
                    }
                    console.log(`Running in parallel: [${steps.map(s => s.name).join(', ')}]`)
                    await Promise.all(steps.map(step => step.run(store)))
                } else {
                    const step = entry(keys)
                    validateStep(step, store)
                    console.log(`Running step: ${step.name}`)
                    await step.run(store)
                }
            }
        })
    }

    return {
        runPipeline,
        getStore
    }
}
