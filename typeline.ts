import { AsyncLocalStorage } from 'node:async_hooks'

// --- Typed Key / Store ---

declare const brand: unique symbol

export type TypedKey<T> = {
    readonly [brand]: T
    readonly sym: symbol
    readonly name: string
}

export function createKey<T>(name: string): TypedKey<T> {
    return { sym: Symbol(name), name } as TypedKey<T>
}

export class TypedMap {
    private map = new Map<symbol, unknown>()

    get<T>(key: TypedKey<T>): T | undefined {
        return this.map.get(key.sym) as T | undefined
    }

    set<T>(key: TypedKey<T>, value: NoInfer<T>): void {
        this.map.set(key.sym, value)
    }

    has(key: TypedKey<unknown>): boolean {
        return this.map.has(key.sym)
    }
}

// --- Pipeline ---

export type Step = {
    name: string,
    requires?: TypedKey<unknown>[],
    run: (store: TypedMap) => void | Promise<void>
}

export type StepFactory<K extends Record<string, TypedKey<unknown>>> = (keys: K) => Step

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

// --- Step Factory ---

export function defineStep<K extends Record<string, TypedKey<unknown>>>(
    factory: (keys: K) => Step
): StepFactory<K> {
    return (keys: K) => factory(keys)
}

