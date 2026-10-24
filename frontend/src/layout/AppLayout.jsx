import { AppShell, Container, Group, Text } from '@mantine/core'
import { IconPackage } from '@tabler/icons-react'
import { Link, NavLink, Outlet } from 'react-router'
import { AccountSwitch } from '../account/AccountSwitch'
import { useAccount } from '../account/accountContext'
import classes from './AppLayout.module.css'

export function AppLayout() {
  const { isStaff } = useAccount()

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header className={classes.header}>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="xl" wrap="nowrap">
              <Group component={Link} to="/" gap={8} className={classes.brand} wrap="nowrap">
                <IconPackage size={26} color="var(--mantine-color-akronGold-6)" />
                <Text fw={700} fz="xl">Reclaim</Text>
              </Group>
              <Group gap={4} visibleFrom="sm" wrap="nowrap">
                <NavLink to="/" end className={classes.link}>Catalog</NavLink>
                <NavLink to="/lost-reports" className={classes.link}>Lost Reports</NavLink>
                {isStaff && <NavLink to="/claims" className={classes.link}>Claims</NavLink>}
              </Group>
            </Group>
            <AccountSwitch />
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main bg="gray.0">
        <Container size="xl" py="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
