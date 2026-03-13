import { useState } from 'react'
import { Paper, TextInput, PasswordInput, Button, Title, Alert } from '@mantine/core'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    try {
      const res = await fetch('http://localhost:3009/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Успешно! ID: ' + data.id)
        setEmail('')
        setPassword('')
        setName('')
      } else {
        setError(data.message || 'Ошибка регистрации')
      }
    } catch (error) {
      setError('Ошибка соединения с сервером')
    }
  }

  return (
    <Paper withBorder shadow="md" p="xl" radius="md">
      <Title order={2} ta="center" mb="lg">
        Регистрация
      </Title>

      <form onSubmit={handleRegister}>
        <TextInput
          label="Имя"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          mb="md"
        />
        
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
          placeholder="Минимум 6 символов"
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

        {message && (
          <Alert color="green" mb="md">
            {message}
          </Alert>
        )}

        <Button type="submit" fullWidth>
          Зарегистрироваться
        </Button>
      </form>
    </Paper>
  )
}

export default Register