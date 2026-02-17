import type { TypedKey } from './key'
import type { StepFactory } from './step'
import type { PipelineEntryFactory } from './pipeline'
import { parallel } from './pipeline'

type ResolvedStep = {
    index: number,
    name: string,
    requires: symbol[],
    provides: symbol[],
    factory: StepFactory<any>,
}

export function optimize<K extends Record<string, TypedKey<unknown>>>(
    keys: K,
    factories: StepFactory<any>[],
): PipelineEntryFactory<K>[] {
    // 1. Instantiate each factory to inspect requires/provides
    const resolved: ResolvedStep[] = factories.map((factory, index) => {
        const step = factory(keys)
        return {
            index,
            name: step.name,
            requires: (step.requires ?? []).map(k => k.sym),
            provides: (step.provides ?? []).map(k => k.sym),
            factory,
        }
    })

    // 2. Build levels via topological grouping
    const levels: ResolvedStep[][] = []
    const placed = new Set<number>()
    const available = new Set<symbol>() // keys available from completed levels

    while (placed.size < resolved.length) {
        const level: ResolvedStep[] = []

        for (const step of resolved) {
            if (placed.has(step.index)) continue
            const satisfied = step.requires.every(sym => available.has(sym))
            if (satisfied) {
                level.push(step)
            }
        }

        if (level.length === 0) {
            const remaining = resolved
                .filter(s => !placed.has(s.index))
                .map(s => s.name)
                .join(', ')
            throw new Error(
                `Circular or unsatisfied dependency detected. ` +
                `Remaining steps: [${remaining}]`
            )
        }

        for (const step of level) {
            placed.add(step.index)
            for (const sym of step.provides) {
                available.add(sym)
            }
        }

        levels.push(level)
    }

    // 3. Log the optimization plan
    console.log("📊 Optimization plan:")
    for (const [i, level] of levels.entries()) {
        const names = level.map(s => s.name)
        if (names.length === 1) {
            console.log(`  Level ${i + 1}: ${names[0]}`)
        } else {
            console.log(`  Level ${i + 1}: parallel([${names.join(', ')}])`)
        }
    }
    console.log()

    // 4. Convert levels to PipelineEntryFactory[]
    const entries: PipelineEntryFactory<K>[] = []
    for (const level of levels) {
        const first = level[0]
        if (level.length === 1 && first) {
            entries.push(first.factory as StepFactory<K>)
        } else {
            entries.push(parallel(level.map(s => s.factory)))
        }
    }

    return entries
}
