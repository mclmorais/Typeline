# typeline

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Typed Key / Store

Typeline uses a **typed key** pattern to make values in the `AsyncLocalStorage` store fully type-safe at compile time.

### `createKey<T>(name)`

Creates a typed token that associates a name with a specific value type. The key is backed by a `symbol` for uniqueness, and branded with a phantom type so TypeScript treats `TypedKey<number>` and `TypedKey<string>` as distinct types.

```typescript
import { createKey } from './typeline'

const countKey = createKey<number>("count")
const nameKey  = createKey<string>("name")
```

#### How type branding works

TypeScript uses **structural typing** — two types are compatible if they have the same shape, regardless of their names. This means a plain `{ sym: symbol }` would make `TypedKey<number>` and `TypedKey<string>` indistinguishable, since neither has a structural difference.

To solve this, `TypedKey` uses a **branded type** pattern:

```typescript
declare const brand: unique symbol

type TypedKey<T> = {
    readonly [brand]: T   // phantom property — carries type info
    readonly sym: symbol  // actual runtime key
    readonly name: string // debug name
}
```

Key elements:

- **`declare const brand: unique symbol`** — `declare` means this symbol only exists at the type level, never at runtime. The `unique symbol` ensures no other type can accidentally match it.
- **`readonly [brand]: T`** — a computed property keyed by the unique symbol. Since `T` differs between keys (`number` vs `string`), TypeScript sees them as structurally different types. This property is never read or written at runtime — it's purely a **phantom type** that carries type information.
- **`as TypedKey<T>` in `createKey`** — the cast is safe because `[brand]` is never accessed at runtime. The actual object only contains `sym` and `name`, but TypeScript trusts the assertion for type-checking purposes.

This means `TypedMap.set(countKey, "hello")` is a compile error because `countKey` is `TypedKey<number>`, so the `set` method's generic resolves `T = number` and rejects the `string` argument.

### `TypedMap`

A type-safe wrapper around `Map<symbol, unknown>`. The `get` and `set` methods use the key's generic to enforce the correct value type:

```typescript
const store = new TypedMap()

store.set(countKey, 42)          // ✅ number matches TypedKey<number>
store.set(countKey, "forty-two") // ❌ compile error — string is not number

const count = store.get(countKey) // inferred as number | undefined
```

The `set` method uses `NoInfer<T>` on the value parameter so that the key alone drives type inference — TypeScript won't widen the type by combining information from both arguments.

### Key registry

All typed keys are defined in a central `keys.ts` object that acts as the schema of the pipeline's shared state:

```typescript
// keys.ts
import { createKey } from './typeline'

export const keys = {
    value: createKey<string>("value"),
    count: createKey<number>("count"),
}
```

Steps import the `keys` object and reference keys via `keys.value`, `keys.count`, etc. — giving you autocomplete on `keys.` and avoiding circular dependencies.
