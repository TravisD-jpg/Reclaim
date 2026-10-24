import { useEffect, useState } from 'react'
import { Button, Center, Loader, Paper, Stack, Table, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconMoodEmpty, IconPlus } from '@tabler/icons-react'
import { Link } from 'react-router'
import { api } from '../api'
import { useAccount } from '../account/accountContext'
import { StatusBadge } from '../components/StatusBadge'
import { formatDate } from '../format'
import { PageHeader } from '../layout/PageHeader'

// Staff see every report; everyone else sees only the reports they filed.
export function LostReportsPage() {
  const { account, isStaff } = useAccount()
  const [reports, setReports] = useState(null)
  const userId = account?.userId

  useEffect(() => {
    if (userId === undefined) return
    let ignore = false // Drop responses that arrive after the account switched.
    api.get(isStaff ? '/lost-reports' : `/lost-reports?userId=${userId}`)
      .then((result) => !ignore && setReports(result))
      .catch((error) => notifications.show({ color: 'red', title: 'Could not load reports', message: error.message }))
    return () => { ignore = true }
  }, [userId, isStaff])

  return (
    <>
      <PageHeader
        title="Lost Reports"
        description={isStaff ? 'Items people have reported missing.' : 'Items you have reported missing.'}
      >
        <Button component={Link} to="/lost-reports/new" leftSection={<IconPlus size={16} />}>Report lost item</Button>
      </PageHeader>

      <Paper withBorder>
        {reports === null ? (
          <Center p="xl"><Loader /></Center>
        ) : reports.length === 0 ? (
          <Stack align="center" gap="xs" p="xl" c="dimmed">
            <IconMoodEmpty size={32} />
            <Text>No lost reports yet.</Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table striped verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Last seen</Table.Th>
                  <Table.Th>Date lost</Table.Th>
                  {isStaff && <Table.Th>Reported by</Table.Th>}
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reports.map((report) => (
                  <Table.Tr key={report.reportId}>
                    <Table.Td>
                      <Text fw={500} size="sm">{report.name}</Text>
                      {report.description && <Text c="dimmed" size="xs" lineClamp={1}>{report.description}</Text>}
                    </Table.Td>
                    <Table.Td>{report.categoryName ?? '—'}</Table.Td>
                    <Table.Td>{report.building ?? '—'}</Table.Td>
                    <Table.Td>{formatDate(report.dateLost)}</Table.Td>
                    {isStaff && <Table.Td>{report.reporterName}</Table.Td>}
                    <Table.Td><StatusBadge status={report.status} /></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>
    </>
  )
}
