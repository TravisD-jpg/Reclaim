import { useEffect, useState } from 'react'
import { Button, Center, Grid, Group, Loader, Paper, Select, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useNavigate, useParams } from 'react-router'
import { api } from '../api'
import { useLookups } from '../hooks/useLookups'
import { PageHeader } from '../layout/PageHeader'

// Claimed is set by the claims endpoints, not by hand, so it's only shown for items that already have it.
const statusOptions = [
  { value: 'stored', label: 'Stored' },
  { value: 'disposed', label: 'Disposed' },
]

const emptyItem = { name: '', description: '', categoryId: null, foundLocationId: null, heldAtLocationId: null, dateFound: '', status: 'stored', photoUrl: '' }

// API item -> form values. Selects need string ids and inputs need '' instead of null.
function toFormValues(item) {
  return {
    name: item.name,
    description: item.description ?? '',
    categoryId: item.categoryId === null ? null : String(item.categoryId),
    foundLocationId: item.foundLocationId === null ? null : String(item.foundLocationId),
    heldAtLocationId: String(item.heldAtLocationId),
    dateFound: item.dateFound,
    status: item.status,
    photoUrl: item.photoUrl ?? '',
  }
}

// One page for both routes: /items/new logs an item, /items/:id/edit changes one.
export function ItemFormPage() {
  const { id } = useParams()
  const [initialValues, setInitialValues] = useState(id === undefined ? emptyItem : null)

  useEffect(() => {
    if (id === undefined) return
    api.get(`/items/${id}`)
      .then((item) => setInitialValues(toFormValues(item)))
      .catch((error) => notifications.show({ color: 'red', title: 'Could not load item', message: error.message }))
  }, [id])

  if (!initialValues) return <Center p="xl"><Loader /></Center>
  return <ItemForm itemId={id} initialValues={initialValues} />
}

function ItemForm({ itemId, initialValues }) {
  const isEdit = itemId !== undefined
  const navigate = useNavigate()
  const { categoryOptions, locationOptions, dropoffOptions } = useLookups()
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues,
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required'),
      heldAtLocationId: (value) => (value ? null : 'Pickup desk is required'),
      dateFound: (value) => (value ? null : 'Date found is required'),
    },
  })

  async function save(values) {
    const request = {
      ...values,
      name: values.name.trim(),
      description: values.description.trim() || null,
      categoryId: values.categoryId && Number(values.categoryId),
      foundLocationId: values.foundLocationId && Number(values.foundLocationId),
      heldAtLocationId: Number(values.heldAtLocationId),
      photoUrl: values.photoUrl.trim() || null,
    }
    setSaving(true)
    try {
      const saved = isEdit ? await api.put(`/items/${itemId}`, request) : await api.post('/items', request)
      notifications.show({ color: 'teal', message: `${saved.name} ${isEdit ? 'updated' : 'logged'}.` })
      navigate(`/items/${saved.itemId}`)
    } catch (error) {
      notifications.show({ color: 'red', title: 'Could not save item', message: error.message })
      setSaving(false)
    }
  }

  const isClaimed = form.values.status === 'claimed'

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit item' : 'Log found item'}
        description={isEdit ? 'Change the details of an item.' : 'Record an item turned in at a drop-off point.'}
      />

      <Paper withBorder p="md" maw={720} component="form" onSubmit={form.onSubmit(save)}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput label="Name" placeholder="e.g. Black Jansport backpack" withAsterisk maxLength={100}
              {...form.getInputProps('name')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea label="Description" placeholder="Color, brand, condition, anything that stands out" autosize minRows={3}
              {...form.getInputProps('description')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Category" placeholder="Pick a category" data={categoryOptions} clearable searchable
              {...form.getInputProps('categoryId')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Found at" placeholder="Pick a building" data={locationOptions} clearable searchable
              {...form.getInputProps('foundLocationId')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Held at" placeholder="Pick a drop-off desk" data={dropoffOptions} withAsterisk
              {...form.getInputProps('heldAtLocationId')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput type="date" label="Date found" withAsterisk {...form.getInputProps('dateFound')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Status" allowDeselect={false} disabled={isClaimed}
              data={isClaimed ? [{ value: 'claimed', label: 'Claimed' }] : statusOptions}
              description={isClaimed ? "Set by the item's claim" : undefined}
              {...form.getInputProps('status')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput label="Photo URL" placeholder="Optional" maxLength={255} {...form.getInputProps('photoUrl')} />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Log item'}</Button>
        </Group>
      </Paper>
    </>
  )
}
