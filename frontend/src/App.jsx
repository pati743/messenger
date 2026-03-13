import { useState, useEffect } from 'react'
import { AppShell, Container, Tabs, Button, Avatar, Text, Group, Box, Paper } from '@mantine/core'
import { IconMessage, IconUsers, IconLogout } from '@tabler/icons-react'
import '@mantine/core/styles.css'
import Register from './Register'
import Login from './Login'
import UsersList from './UsersList'
import Chat from './Chat'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('login')
  const [selectedUser, setSelectedUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setActiveTab('users')
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedUser(null)
    setActiveTab('login')
  }

  const handleSelectUser = (otherUser) => {
    setSelectedUser(otherUser)
  }

  const handleCloseChat = () => {
    setSelectedUser(null)
  }

  if (!user) {
    return (
      <Container size="xs" py="xl">
        <Paper shadow="lg" radius="lg" p="xl" withBorder>
          <Group justify="center" mb="lg">
            <IconMessage size={48} color="#228be6" />
            <Text size="xl" fw={700}>Telegram Clone</Text>
          </Group>
          
          <Tabs value={activeTab} onChange={setActiveTab} radius="md">
            <Tabs.List grow>
              <Tabs.Tab value="login">Вход</Tabs.Tab>
              <Tabs.Tab value="register">Регистрация</Tabs.Tab>
            </Tabs.List>

            <Box mt="md">
              <Tabs.Panel value="login">
                <Login onLogin={handleLogin} />
              </Tabs.Panel>

              <Tabs.Panel value="register">
                <Register />
              </Tabs.Panel>
            </Box>
          </Tabs>
        </Paper>
      </Container>
    )
  }

  if (selectedUser) {
    return (
      <Container size="md" py="md" style={{ height: '100vh' }}>
        <Paper shadow="lg" radius="lg" style={{ height: 'calc(100vh - 2rem)' }}>
          <Chat user={user} otherUser={selectedUser} onClose={handleCloseChat} />
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="md" py="md">
      <Paper shadow="lg" radius="lg">
        {/* Header */}
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Group>
            <Avatar color="blue" radius="xl">
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Text fw={500}>{user.name}</Text>
              <Text size="xs" c="dimmed">Online</Text>
            </Box>
          </Group>
          <Button 
            variant="subtle" 
            color="gray" 
            onClick={handleLogout}
            leftSection={<IconLogout size={16} />}
          >
            Выйти
          </Button>
        </Group>

        {/* Users list */}
        <Box p="md">
          <UsersList user={user} onSelectUser={handleSelectUser} />
        </Box>
      </Paper>
    </Container>
  )
}

export default App