declare const brand: unique symbol

export type TypedKey<T> = {
    readonly [brand]: T
    readonly sym: symbol
    readonly name: string
}

export function createKey<T>(name: string): TypedKey<T> {
    return { sym: Symbol(name), name } as TypedKey<T>
}
