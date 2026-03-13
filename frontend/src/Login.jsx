import { useState } from 'react'
import { Paper, TextInput, PasswordInput, Button, Title, Alert } from '@mantine/core'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('http://localhost:3009/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        onLogin(data)
      } else {
        setError(data.message || 'Неверный email или пароль')
      }
    } catch (error) {
      setError('Ошибка соединения с сервером')
    }
  }

  return (
    <Paper withBorder shadow="md" p="xl" radius="md">
      <Title order={2} ta="center" mb="lg">
        Вход
      </Title>

      <form onSubmit={handleLogin}>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          mb="md"
        />
        
        <PasswordInput
          label="Пароль"
          placeholder="Ваш пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          mb="lg"
        />

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <Button type="submit" fullWidth>
          Войти
        </Button>
      </form>
    </Paper>
  )
}

export default Login