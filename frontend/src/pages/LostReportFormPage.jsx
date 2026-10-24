import { useState } from 'react'
import { Button, Grid, Group, Paper, Select, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router'
import { api } from '../api'
import { useAccount } from '../account/accountContext'
import { useLookups } from '../hooks/useLookups'
import { PageHeader } from '../layout/PageHeader'

// Files a report as the "Acting as" account. Status starts as open on the server.
export function LostReportFormPage() {
  const navigate = useNavigate()
  const { account } = useAccount()
  const { categoryOptions, locationOptions } = useLookups()
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: { name: '', description: '', categoryId: null, lastSeenLocationId: null, dateLost: '' },
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required'),
    },
  })

  async function save(values) {
    const request = {
      userId: account.userId,
      name: values.name.trim(),
      description: values.description.trim() || null,
      categoryId: values.categoryId && Number(values.categoryId),
      lastSeenLocationId: values.lastSeenLocationId && Number(values.lastSeenLocationId),
      dateLost: values.dateLost || null,
    }
    setSaving(true)
    try {
      await api.post('/lost-reports', request)
      notifications.show({ color: 'teal', message: 'Lost report filed.' })
      navigate('/lost-reports')
    } catch (error) {
      notifications.show({ color: 'red', title: 'Could not file report', message: error.message })
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Report lost item" description="Describe what you lost so staff can match it to items turned in." />

      <Paper withBorder p="md" maw={720} component="form" onSubmit={form.onSubmit(save)}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput label="What did you lose?" placeholder="e.g. Blue Hydro Flask water bottle" withAsterisk maxLength={100}
              {...form.getInputProps('name')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea label="Description" placeholder="Color, brand, stickers, anything that makes it yours" autosize minRows={3}
              {...form.getInputProps('description')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Category" placeholder="Pick a category" data={categoryOptions} clearable searchable
              {...form.getInputProps('categoryId')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select label="Last seen at" placeholder="Pick a building" data={locationOptions} clearable searchable
              {...form.getInputProps('lastSeenLocationId')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput type="date" label="Date lost" {...form.getInputProps('dateLost')} />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={saving} disabled={!account}>File report</Button>
        </Group>
      </Paper>
    </>
  )
}
