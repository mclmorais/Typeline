import type { TypedKey } from './key'
import type { TypedMap } from './store'

export type Step = {
    name: string,
    requires?: TypedKey<unknown>[],
    run: (store: TypedMap) => void | Promise<void>
}

export type StepFactory<K extends Record<string, TypedKey<unknown>>> = (keys: K) => Step

export function defineStep<K extends Record<string, TypedKey<unknown>>>(
    factory: (keys: K) => Step
): StepFactory<K> {
    return (keys: K) => factory(keys)
}
