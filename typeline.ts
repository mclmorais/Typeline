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
    run: (store: TypedMap) => void
}

export function createPipeline() {
    const asyncLocalStorage = new AsyncLocalStorage<TypedMap>()

    const getStore = () => asyncLocalStorage.getStore()

    const runPipeline = (steps: Step[]) => {
        asyncLocalStorage.run(new TypedMap(), () => {
            const store = asyncLocalStorage.getStore()!
            for (const step of steps) {
                // Validate required keys before running the step
                for (const key of step.requires ?? []) {
                    if (!store.has(key)) {
                        throw new Error(
                            `Step "${step.name}" requires key "${key.name}" but it has not been set. ` +
                            `Ensure a preceding step sets this value before this step runs.`
                        )
                    }
                }

                console.log(`Running step: ${step.name}`)
                step.run(store)
            }
        })
    }

    return {
        runPipeline,
        getStore
    }
}
