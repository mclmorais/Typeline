import type { TypedKey } from './key'

export class TypedMap {
    private map = new Map<symbol, unknown>()

    get<T>(key: TypedKey<T>): T | undefined {
        return this.map.get(key.sym) as T | undefined
    }

    require<T>(key: TypedKey<T>): T {
        if (!this.map.has(key.sym)) {
            throw new Error(`Required key "${key.name}" is not set.`)
        }
        return this.map.get(key.sym) as T
    }

    set<T>(key: TypedKey<T>, value: NoInfer<T>): void {
        this.map.set(key.sym, value)
    }

    has(key: TypedKey<unknown>): boolean {
        return this.map.has(key.sym)
    }
}
