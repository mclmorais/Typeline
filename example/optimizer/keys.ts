import { createKey } from '../../typeline'

export type User = { id: string, name: string }
export type Orders = { count: number, total: number }
export type Preferences = { theme: string, language: string }
export type Report = { summary: string }

export const keys = {
    user: createKey<User>("user"),
    orders: createKey<Orders>("orders"),
    preferences: createKey<Preferences>("preferences"),
    report: createKey<Report>("report"),
}
