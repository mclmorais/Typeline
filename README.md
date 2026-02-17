# Typeline

A type-safe pipeline framework for TypeScript, built on `AsyncLocalStorage`.

Typeline lets you compose pipelines from reusable, typed steps that share data through a type-safe store. Steps declare what they **require** and **provide**, enabling parallel execution, conditional branching, and automatic optimization.

## Install

```bash
bun install
```

## Quick Start

### 1. Define your keys

Keys are the schema of your pipeline's shared state. Each key is typed and unique:

```typescript
// keys.ts
import { createKey } from './typeline'

export const keys = {
    user: createKey<User>("user"),
    orders: createKey<Order[]>("orders"),
}
```

### 2. Define your steps

Steps are factory functions created with `defineStep`. Each step declares its key requirements via structural typing — it only asks for the keys it needs:

```typescript
// steps/fetch-user.ts
import { defineStep } from './typeline'

export const FetchUserStep = defineStep(
    (keys: { user: TypedKey<User> }) => ({
        name: "Fetch User",
        requires: [],
        provides: [keys.user],
        run: async (store) => {
            const user = await fetchUser()
            store.set(keys.user, user)
        }
    })
)
```

- **`requires`** — keys that must exist in the store before this step runs (validated at runtime)
- **`provides`** — keys this step sets in the store (used by the optimizer)

### 3. Create and run a pipeline

Bind your keys to a pipeline with `createPipeline`, then pass step factories directly:

```typescript
import { createPipeline } from './typeline'
import { keys } from './keys'

const { runPipeline } = createPipeline(keys)

await runPipeline([
    FetchUserStep,
    FetchOrdersStep,
    GenerateReportStep,
])
```

Steps are called with the bound `keys` automatically — no need to pass them manually.

## Core Concepts

### Typed Store

The pipeline store (`TypedMap`) is type-safe. Keys created with `createKey<T>()` use a branded type pattern so `TypedKey<number>` and `TypedKey<string>` are structurally distinct:

```typescript
store.set(countKey, 42)          // ✅
store.set(countKey, "forty-two") // ❌ compile error

const count = store.get(countKey)     // number | undefined
const count = store.require(countKey) // number (throws if missing)
```

- **`get(key)`** — returns `T | undefined`, for optional lookups
- **`require(key)`** — returns `T`, throws a descriptive error if missing. Safe to use when the key is listed in `requires`, since the pipeline validates before execution
- **`set(key, value)`** — uses `NoInfer<T>` so the key alone drives type inference

### Reusable Steps

Steps use structural typing for their key requirements. A step that needs `{ user: TypedKey<User> }` works in **any** pipeline whose keys include a `user: TypedKey<User>`:

```typescript
// Works in pipeline A with { user, orders, report }
// Works in pipeline B with { user, greeting }
// Only { user: TypedKey<User> } is required
export const FetchUserStep = defineStep(
    (keys: { user: TypedKey<User> }) => ({ ... })
)
```

### Key Binding

`createPipeline(keys)` binds the keys object to the pipeline. Steps receive the keys automatically when the pipeline runs — no manual wiring:

```typescript
const pipelineA = createPipeline(keysA)
const pipelineB = createPipeline(keysB)

// Same step, different pipelines — type-checked at compile time
await pipelineA.runPipeline([FetchUserStep, ...])
await pipelineB.runPipeline([FetchUserStep, ...])
```

## Helper Functions

### `parallel(steps)`

Runs multiple steps concurrently using `Promise.all`. Use when steps have no data dependencies between each other:

```typescript
await runPipeline([
    FetchUserStep,
    parallel([FetchOrdersStep, FetchPreferencesStep]),  // run at the same time
    GenerateReportStep,
])
```

Both `FetchOrdersStep` and `FetchPreferencesStep` require `user` (set by the first step) but don't depend on each other, so they run in parallel.

### `fork(condition, trueBranch, falseBranch)`

Selects between two pipeline paths at runtime based on data in the store:

```typescript
await runPipeline([
    AssignRoleStep,
    fork(
        (store: TypedMap) => store.require(keys.role) === 'admin',
        [AdminStep],    // runs if condition is true
        [MemberStep],   // runs if condition is false
    ),
    PrintResultStep,    // runs after either branch
])
```

Branches can contain any pipeline entries — sequential steps, `parallel()` groups, or even nested `fork()` calls.

### `optimize(keys, steps)`

Analyzes step dependencies (`requires` / `provides`) and returns an optimized pipeline with independent steps auto-grouped into `parallel()`:

```typescript
const optimized = optimize(keys, [
    FetchUserStep,         // provides: [user]
    FetchOrdersStep,       // requires: [user], provides: [orders]
    FetchPreferencesStep,  // requires: [user], provides: [preferences]
    GenerateReportStep,    // requires: [user, orders, preferences]
])
// Result:
//   Level 1: FetchUser
//   Level 2: parallel([FetchOrders, FetchPreferences])
//   Level 3: GenerateReport
```

The algorithm performs **topological level grouping**: steps whose dependencies are all satisfied by earlier levels get grouped into `parallel()`. It also detects circular or unsatisfied dependencies.

## Examples

Run any example with:

```bash
bun run example/<name>/main.ts
```

### `example/basic/`

Demonstrates the fundamental features: typed keys, `requires` validation, parallel execution, and step reuse with different key objects.

```
=== Correct order ===
Running step: Set Value Step → Value set
Running step: Get Value Step → Value: some value

=== Wrong order ===
Step "Get Value Step" requires key "value" but it has not been set.
```

### `example/user-profile/`

A realistic multi-step async pipeline that fetches a user, loads orders and preferences in parallel, generates a report, and prints it.

```
Running step: Fetch User
Running in parallel: [Fetch Orders, Fetch Preferences]
Running step: Generate Report
Running step: Print Report
⏱  Pipeline completed in ~1000ms
```

### `example/cross-pipeline/`

Shows how a step from one example can be reused in a completely different pipeline. Imports `FetchUserStep` from the user-profile example and uses it alongside a local `GreetUserStep`:

```typescript
import { FetchUserStep } from '../user-profile/steps/fetch-user'

await runPipeline([
    FetchUserStep,   // ← reused from another example
    GreetUserStep,   // ← unique to this pipeline
])
```

### `example/fork/`

Demonstrates conditional branching with `fork()`. Randomly assigns a role, then takes a different pipeline path:

```
Running step: Assign Role → admin
Fork: taking true branch
Running step: Admin Access → 🔑 Granting admin dashboard access
```

### `example/optimizer/`

Runs a sequential pipeline through `optimize()`, which auto-parallelizes independent steps. Compares timing between the unoptimized and optimized versions:

```
📊 Optimization plan:
  Level 1: Fetch User
  Level 2: parallel([Fetch Orders, Fetch Preferences])
  Level 3: Generate Report

⏱  Sequential: 753ms
⏱  Optimized:  501ms
🚀 Saved 252ms (34% faster)
```

## Project Structure

```
typeline/
  key.ts          TypedKey type + createKey factory
  store.ts        TypedMap class (get, require, set, has)
  step.ts         Step/StepFactory types + defineStep helper
  pipeline.ts     createPipeline, parallel, fork, validation
  optimize.ts     Dependency analysis + auto-parallelization
  index.ts        Barrel export

example/
  basic/          Typed store, requires validation, parallel
  user-profile/   Multi-step async pipeline with parallel I/O
  cross-pipeline/ Reusing steps across pipelines
  fork/           Conditional branching
  optimizer/      Auto-parallelization via dependency analysis
```
