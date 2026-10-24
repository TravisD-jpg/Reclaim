import { Group, Stack, Text, Title } from '@mantine/core'

// Title, one-line description, and optional actions (buttons) shared by every page.
export function PageHeader({ title, description, children }) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg">
      <Stack gap={4}>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {children && <Group gap="sm">{children}</Group>}
    </Group>
  )
}
