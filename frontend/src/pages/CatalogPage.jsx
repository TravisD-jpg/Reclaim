import { useEffect, useState } from 'react'
import { Paper, Text } from '@mantine/core'
import { api } from '../api'
import { PageHeader } from '../layout/PageHeader'

export function CatalogPage() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    api.get('/items').then(setItems)
  }, [])

  return (
    <>
      <PageHeader title="Catalog" description="Every item turned in at a campus drop-off point." />
      <Paper withBorder p="lg">
        <Text>{items ? `${items.length} items in the catalog.` : 'Loading...'}</Text>
      </Paper>
    </>
  )
}
