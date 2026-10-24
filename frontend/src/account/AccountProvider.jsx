import { useEffect, useState } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { api } from '../api'
import { AccountContext } from './accountContext'

export function AccountProvider({ children }) {
  const [users, setUsers] = useState([])
  // Remembered across page reloads so the demo doesn't reset to the default account.
  const [userId, setUserId] = useLocalStorage({ key: 'reclaim-acting-as', defaultValue: null })

  useEffect(() => {
    api.get('/users')
      .then(setUsers)
      .catch((error) => notifications.show({ color: 'red', title: 'Could not load accounts', message: error.message }))
  }, [])

  // Default to the first staff member so staff actions are visible when the app opens.
  const account = users.find((user) => String(user.userId) === userId)
    ?? users.find((user) => user.role === 'staff')
    ?? null
  const isStaff = account?.role === 'staff' || account?.role === 'dev'

  return (
    <AccountContext.Provider value={{ users, account, isStaff, setUserId }}>
      {children}
    </AccountContext.Provider>
  )
}
