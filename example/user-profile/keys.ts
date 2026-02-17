import { createKey } from '../../typeline'

export type User = {
    id: string
    name: string
    email: string
}

export type Order = {
    id: string
    product: string
    amount: number
}

export type Preferences = {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
}

export type Report = {
    userName: string
    totalSpent: number
    orderCount: number
    preferredTheme: string
}

export const keys = {
    user: createKey<User>("user"),
    orders: createKey<Order[]>("orders"),
    preferences: createKey<Preferences>("preferences"),
    report: createKey<Report>("report"),
}
