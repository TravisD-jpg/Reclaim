import { createContext, useContext } from 'react'

export const AccountContext = createContext(null)

// The demo's "Acting as" account: { users, account, isStaff, setUserId }. Replaced by login in Phase 3.
export function useAccount() {
  return useContext(AccountContext)
}
