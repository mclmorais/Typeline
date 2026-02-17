import { AsyncLocalStorage } from 'node:async_hooks'

// --- Typed Key / Store ---

declare const brand: unique symbol

export type TypedKey<T> = {
    readonly [brand]: T
    readonly sym: symbol
}

export function createKey<T>(name: string): TypedKey<T> {
    return { sym: Symbol(name) } as TypedKey<T>
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

export function createPipeline() {
    const asyncLocalStorage = new AsyncLocalStorage<TypedMap>()

    type Step = {
        name: string,
        run: (store: TypedMap) => void
    }

    const getStore = () => asyncLocalStorage.getStore()

    const runPipeline = (steps: Step[]) => {
        asyncLocalStorage.run(new TypedMap(), () => {
            const store = asyncLocalStorage.getStore()!
            for (const step of steps) {
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

// --- Example Usage ---

const valueKey = createKey<string>("value")

const { runPipeline } = createPipeline()

const SetValueStep = {
    name: "Set Value Step",
    run: (store: TypedMap) => {
        store.set(valueKey, "some value")
        console.log("Value set")
    }
}

const GetValueStep = {
    name: "Get Value Step",
    run: (store: TypedMap) => {
        const value = store.get(valueKey)
        console.log("Value: ", value)
    }
}

runPipeline([SetValueStep, GetValueStep])