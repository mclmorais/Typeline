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

export type ParallelGroup = {
    readonly __parallel: true,
    readonly steps: Step[]
}

export type PipelineEntry = Step | ParallelGroup

export function parallel(steps: Step[]): ParallelGroup {
    return { __parallel: true, steps }
}

function isParallelGroup(entry: PipelineEntry): entry is ParallelGroup {
    return '__parallel' in entry
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

export function createPipeline() {
    const asyncLocalStorage = new AsyncLocalStorage<TypedMap>()

    const getStore = () => asyncLocalStorage.getStore()

    const runPipeline = (entries: PipelineEntry[]) => {
        return asyncLocalStorage.run(new TypedMap(), async () => {
            const store = asyncLocalStorage.getStore()!
            for (const entry of entries) {
                if (isParallelGroup(entry)) {
                    for (const step of entry.steps) {
                        validateStep(step, store)
                    }
                    console.log(`Running in parallel: [${entry.steps.map(s => s.name).join(', ')}]`)
                    await Promise.all(entry.steps.map(step => step.run(store)))
                } else {
                    validateStep(entry, store)
                    console.log(`Running step: ${entry.name}`)
                    await entry.run(store)
                }
            }
        })
    }

    return {
        runPipeline,
        getStore
    }
}
