import { Badge, Group, Select } from '@mantine/core'
import { IconUserCircle } from '@tabler/icons-react'
import { useAccount } from './accountContext'

const roleGroups = [
  { role: 'dev', group: 'Developers' },
  { role: 'staff', group: 'Staff' },
  { role: 'user', group: 'Students' },
]

export function AccountSwitch() {
  const { users, account, isStaff, setUserId } = useAccount()

  const options = roleGroups.map(({ role, group }) => ({
    group,
    items: users
      .filter((user) => user.role === role)
      .map((user) => ({ value: String(user.userId), label: user.name })),
  }))

  return (
    <Group gap="xs" wrap="nowrap">
      <Select
        aria-label="Acting as"
        placeholder="Acting as"
        data={options}
        value={account ? String(account.userId) : null}
        onChange={setUserId}
        leftSection={<IconUserCircle size={18} />}
        searchable
        allowDeselect={false}
        w={220}
      />
      {account && (
        <Badge color={isStaff ? 'akronGold' : 'gray'} variant="filled" visibleFrom="sm">
          {account.role === 'user' ? 'Student' : account.role}
        </Badge>
      )}
    </Group>
  )
}
