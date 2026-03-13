import { useState, useEffect } from 'react'
import { Text, Group, Avatar, TextInput, Loader, Paper, Badge, Box } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

function UsersList({ user, onSelectUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const url = search 
        ? `http://localhost:3009/users?search=${search}`
        : 'http://localhost:3009/users'
      
      const res = await fetch(url)
      const data = await res.json()
      setUsers(data.filter(u => u.id !== user.id))
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <TextInput
        placeholder="Поиск пользователей..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftSection={<IconSearch size={16} />}
        mb="md"
        radius="xl"
        size="md"
      />

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader color="blue" />
        </Box>
      ) : users.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          Пользователей не найдено
        </Text>
      ) : (
        users.map(u => (
          <Paper
            key={u.id}
            p="sm"
            mb="xs"
            radius="lg"
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f8f9fa'
              }
            }}
            onClick={() => onSelectUser(u)}
          >
            <Group>
              <Avatar 
                src={u.avatar} 
                radius="xl" 
                size="lg"
                color="blue"
              >
                {u.name?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box style={{ flex: 1 }}>
                <Group justify="space-between" mb={4}>
                  <Text fw={500} size="md">{u.name}</Text>
                  {u.online && (
                    <Badge color="green" size="sm" circle />
                  )}
                </Group>
                <Text size="sm" c="dimmed" lineClamp={1}>
                  {u.email}
                </Text>
              </Box>
            </Group>
          </Paper>
        ))
      )}
    </Box>
  )
}

export default UsersList