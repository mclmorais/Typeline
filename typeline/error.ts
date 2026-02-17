export class PipelineError extends Error {
    readonly stepName: string
    readonly storeSnapshot: Record<string, unknown>

    constructor(options: {
        stepName: string,
        cause: unknown,
        storeSnapshot: Record<string, unknown>,
    }) {
        const causeMessage = options.cause instanceof Error
            ? options.cause.message
            : String(options.cause)

        super(
            `Pipeline failed at step "${options.stepName}": ${causeMessage}`,
            { cause: options.cause },
        )

        this.name = 'PipelineError'
        this.stepName = options.stepName
        this.storeSnapshot = options.storeSnapshot
    }

    format(): string {
        const lines: string[] = [
            `❌ ${this.message}`,
            '',
            '  Step: ' + this.stepName,
            '',
            '  Error chain:',
        ]

        let current: unknown = this.cause
        let depth = 1
        while (current instanceof Error) {
            const prefix = '    ' + '→ '.repeat(depth)
            lines.push(`${prefix}${current.name}: ${current.message}`)
            current = current.cause
            depth++
        }

        lines.push('')
        lines.push('  Store at time of failure:')

        const entries = Object.entries(this.storeSnapshot)
        if (entries.length === 0) {
            lines.push('    (empty)')
        } else {
            for (const [key, value] of entries) {
                const formatted = formatValue(value)
                lines.push(`    ${key}: ${formatted}`)
            }
        }

        return lines.join('\n')
    }
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return String(value)
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return `Array(${value.length})`
    if (typeof value === 'object') {
        const keys = Object.keys(value)
        return `{ ${keys.join(', ')} }`
    }
    return String(value)
}
