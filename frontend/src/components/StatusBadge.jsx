import { Badge } from '@mantine/core'

// Item statuses (stored, claimed, disposed) and lost report statuses (open, matched, closed).
const statusColors = {
  stored: 'akronBlue',
  claimed: 'teal',
  disposed: 'gray',
  open: 'akronGold',
  matched: 'grape',
  closed: 'gray',
}

export function StatusBadge({ status }) {
  return (
    <Badge color={statusColors[status] ?? 'gray'} variant="light" tt="capitalize">
      {status}
    </Badge>
  )
}
