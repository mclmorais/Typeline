import { createKey } from '../../typeline'
import type { User } from '../user-profile/keys'

/**
 * A different pipeline schema that happens to share
 * the User type with the user-profile example.
 *
 * This allows steps like FetchUserStep (which only need
 * `{ user: TypedKey<User> }`) to be reused here.
 */
export const keys = {
    user: createKey<User>("user"),
    greeting: createKey<string>("greeting"),
}
