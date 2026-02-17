import { createKey } from '../../typeline'
import type { Wine } from './wine-client'

export const keys = {
    wines: createKey<Wine[]>("wines"),
    selection: createKey<Wine[]>("selection"),
}
