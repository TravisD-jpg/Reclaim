import { useEffect, useState } from 'react'
import { Center, Grid, Group, Loader, Pagination, Paper, SegmentedControl, Select, Stack, Table, Text, TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconMoodEmpty, IconSearch } from '@tabler/icons-react'
import { useNavigate } from 'react-router'
import { api } from '../api'
import { StatusBadge } from '../components/StatusBadge'
import { formatDate } from '../format'
import { useLookups } from '../hooks/useLookups'
import { PageHeader } from '../layout/PageHeader'

const PAGE_SIZE = 25

const statusOptions = [
  { value: 'stored', label: 'Stored' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'disposed', label: 'Disposed' },
  { value: 'all', label: 'All' },
]

export function CatalogPage() {
  const navigate = useNavigate()
  const { categoryOptions, locationOptions } = useLookups()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const [categoryId, setCategoryId] = useState(null)
  const [locationId, setLocationId] = useState(null)
  const [status, setStatus] = useState('stored')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState(null)

  // Every filter is sent to GET /api/items, so the SQL query does the searching.
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (categoryId) params.set('categoryId', categoryId)
    if (locationId) params.set('locationId', locationId)
    if (status !== 'all') params.set('status', status)

    let ignore = false // Drop responses that arrive after a newer search started.
    api.get(`/items?${params}`)
      .then((result) => !ignore && setItems(result))
      .catch((error) => notifications.show({ color: 'red', title: 'Could not load items', message: error.message }))
    return () => { ignore = true }
  }, [debouncedSearch, categoryId, locationId, status])

  // Any filter change starts back on page 1.
  const withPageReset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const totalPages = items ? Math.max(1, Math.ceil(items.length / PAGE_SIZE)) : 1
  const currentPage = Math.min(page, totalPages)
  const pageItems = items?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ?? []

  return (
    <>
      <PageHeader title="Catalog" description="Every item turned in at a campus drop-off point." />

      <Paper withBorder p="md" mb="md">
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              placeholder="Name or description, e.g. earbuds"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => withPageReset(setSearch)(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
            <Select label="Category" placeholder="Any" data={categoryOptions}
              value={categoryId} onChange={withPageReset(setCategoryId)} clearable searchable />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2.5 }}>
            <Select label="Found at" placeholder="Any building" data={locationOptions}
              value={locationId} onChange={withPageReset(setLocationId)} clearable searchable />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500} mb={4}>Status</Text>
            <SegmentedControl fullWidth data={statusOptions} value={status} onChange={withPageReset(setStatus)} />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder>
        {items === null ? (
          <Center p="xl"><Loader /></Center>
        ) : items.length === 0 ? (
          <Stack align="center" gap="xs" p="xl" c="dimmed">
            <IconMoodEmpty size={32} />
            <Text>No items match these filters.</Text>
          </Stack>
        ) : (
          <>
            <Table.ScrollContainer minWidth={700}>
              <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Found at</Table.Th>
                    <Table.Th>Date found</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pageItems.map((item) => (
                    <Table.Tr key={item.itemId} onClick={() => navigate(`/items/${item.itemId}`)} style={{ cursor: 'pointer' }}>
                      <Table.Td>
                        <Text fw={500} size="sm">{item.name}</Text>
                        {item.description && <Text c="dimmed" size="xs" lineClamp={1}>{item.description}</Text>}
                      </Table.Td>
                      <Table.Td>{item.categoryName ?? '—'}</Table.Td>
                      <Table.Td>{item.building ?? '—'}</Table.Td>
                      <Table.Td>{formatDate(item.dateFound)}</Table.Td>
                      <Table.Td><StatusBadge status={item.status} /></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Group justify="space-between" p="md">
              <Text size="sm" c="dimmed">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, items.length)} of {items.length} items
              </Text>
              <Pagination total={totalPages} value={currentPage} onChange={setPage} size="sm" />
            </Group>
          </>
        )}
      </Paper>
    </>
  )
}
