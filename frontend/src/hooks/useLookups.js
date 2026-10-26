import { useEffect, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { api } from '../api'

const toOption = (l) => ({
  value: String(l.locationId),
  label: l.roomOrArea ? `${l.building} – ${l.roomOrArea}` : l.building,
})

// Categories and locations for filters and form dropdowns, shaped as Mantine Select options.
export function useLookups() {
  const [lookups, setLookups] = useState({ categoryOptions: [], locationOptions: [], dropoffOptions: [] })

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/locations')])
      .then(([categories, locations]) => setLookups({
        categoryOptions: categories.map((c) => ({ value: String(c.categoryId), label: c.name })),
        locationOptions: locations.map(toOption),
        dropoffOptions: locations.filter((l) => l.isDropoffPoint).map(toOption),
      }))
      .catch((error) => notifications.show({ color: 'red', title: 'Could not load filters', message: error.message }))
  }, [])

  return lookups
}
