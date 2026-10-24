import { useEffect, useState } from 'react'
import { Anchor, Button, Center, Grid, Group, Loader, Modal, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft, IconPencil, IconTrash } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../api'
import { useAccount } from '../account/accountContext'
import { StatusBadge } from '../components/StatusBadge'
import { formatDate, formatDateTime } from '../format'

export function ItemDetailPage() {
  const { id } = useParams()
  const { isStaff } = useAccount()
  const [history, setHistory] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [confirmOpen, confirm] = useDisclosure(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/items/${id}/history`)
      .then(setHistory)
      .catch((error) => {
        setNotFound(true)
        notifications.show({ color: 'red', title: 'Could not load item', message: error.message })
      })
  }, [id])

  async function deleteItem() {
    setDeleting(true)
    try {
      await api.delete(`/items/${id}`)
      notifications.show({ color: 'teal', message: `${history.name} deleted.` })
      navigate('/')
    } catch (error) {
      notifications.show({ color: 'red', title: 'Could not delete item', message: error.message })
      setDeleting(false)
      confirm.close()
    }
  }

  if (notFound) return <><BackLink /><Text mt="md">This item could not be found.</Text></>
  if (!history) return <Center p="xl"><Loader /></Center>

  const foundAt = history.roomOrArea ? `${history.building} – ${history.roomOrArea}` : history.building

  return (
    <>
      <BackLink />
      <Group justify="space-between" mt="md" mb="lg">
        <Group gap="sm">
          <Title order={2}>{history.name}</Title>
          <StatusBadge status={history.status} />
        </Group>
        {isStaff && (
          <Group gap="sm">
            <Button component={Link} to="edit" variant="default" leftSection={<IconPencil size={16} />}>Edit</Button>
            <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={confirm.open}>Delete</Button>
          </Group>
        )}
      </Group>

      <Modal opened={confirmOpen} onClose={confirm.close} title="Delete item?" centered>
        <Text size="sm">{history.name} will be removed from the catalog. This can't be undone.</Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={confirm.close}>Cancel</Button>
          <Button color="red" loading={deleting} onClick={deleteItem}>Delete</Button>
        </Group>
      </Modal>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Section title="Item">
            {history.description && <Text mb="md">{history.description}</Text>}
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <Field label="Category" value={history.categoryName} />
              <Field label="Found at" value={foundAt} />
              <Field label="Date found" value={formatDate(history.dateFound)} />
              <Field label="Logged by" value={history.loggedByName} />
            </SimpleGrid>
          </Section>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Section title="Claim">
            {history.claimId === null ? (
              <Text c="dimmed">Not claimed yet.</Text>
            ) : (
              <Stack gap="sm">
                <Field label="Claimed on" value={formatDateTime(history.claimDate)} />
                <Field label="Claimed by" value={isStaff ? `${history.claimantName} (${history.claimantEmail})` : history.claimantName} />
                <Field label="Approved by" value={history.approvedByName} />
                {history.reportId !== null && (
                  <Field label="Lost report" value={`${history.reportName}, lost ${formatDate(history.dateLost)}`} />
                )}
              </Stack>
            )}
            {isStaff && (
              <Text size="sm" c={history.failedAttempts > 0 ? 'red' : 'dimmed'} mt="md">
                {history.failedAttempts} failed verification attempt{history.failedAttempts === 1 ? '' : 's'}
              </Text>
            )}
          </Section>
        </Grid.Col>
      </Grid>
    </>
  )
}

function BackLink() {
  return (
    <Anchor component={Link} to="/" size="sm">
      <Group gap={4}><IconArrowLeft size={14} />Back to catalog</Group>
    </Anchor>
  )
}

function Section({ title, children }) {
  return (
    <Paper withBorder p="md" h="100%">
      <Title order={4} mb="sm">{title}</Title>
      {children}
    </Paper>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Text size="sm">{value ?? '—'}</Text>
    </div>
  )
}
