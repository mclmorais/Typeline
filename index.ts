import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage<string>()


type Step = {
    name: string,
    run: () => void
}

const steps: Step[] = []

function runPipeline(steps: Step[]) {
    for (const step of steps) {
        console.log(`Running step: ${step.name}`)
        step.run()
    }
}

const SetValueStep: Step = {
    name: "Set Value Step",
    run: () => {
        asyncLocalStorage.run("value", () => {
            console.log("Value set")
        })
    }
}

const GetValueStep: Step = {
    name: "Get Value Step",
    run: () => {
        const value = asyncLocalStorage.getStore()
        console.log("Value: ", value)
    }
}

runPipeline([SetValueStep, GetValueStep])