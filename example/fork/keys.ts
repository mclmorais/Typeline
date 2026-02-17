import { createKey } from '../../typeline'

export type Role = 'admin' | 'member'

export const keys = {
    role: createKey<Role>("role"),
    result: createKey<string>("result"),
}
