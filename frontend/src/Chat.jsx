import { useState, useEffect, useRef } from 'react'
import { Paper, Text, Group, Avatar, TextInput, Button, ScrollArea, Box, ActionIcon } from '@mantine/core'
import { IconSend, IconArrowLeft, IconPhoto } from '@tabler/icons-react'
import { io } from 'socket.io-client'
import { notifications } from '@mantine/notifications'

function Chat({ user, otherUser, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [chatId, setChatId] = useState(null)
  const messagesEndRef = useRef(null)

  // Подключение к WebSocket
  useEffect(() => {
    const newSocket = io('http://localhost:3009', {
      query: { userId: user.id }
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to chat')
    })

    return () => newSocket.close()
  }, [user.id])

  // Получение или создание чата
  useEffect(() => {
    if (!otherUser) return

    fetch(`http://localhost:3009/chats/${user.id}/${otherUser.id}`)
      .then(res => res.json())
      .then(data => {
        setChatId(data.id)
        setMessages(data.messages || [])
      })
      .catch(() => {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить чат',
          color: 'red'
        })
      })
  }, [user.id, otherUser])

  // Слушаем новые сообщения
  useEffect(() => {
    if (!socket || !chatId) return

    socket.on('new_message', (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message])
      }
    })

    return () => {
      socket.off('new_message')
    }
  }, [socket, chatId])

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !chatId) return

    socket.emit('send_message', {
      chatId,
      text: newMessage
    })

    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group p="md" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <ActionIcon onClick={onClose} variant="subtle" size="lg">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Avatar src={otherUser?.avatar} radius="xl" color="blue" size="md">
          {otherUser?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text fw={500}>{otherUser?.name}</Text>
          <Text size="xs" c="dimmed">
            {otherUser?.online ? 'в сети' : 'был(а) недавно'}
          </Text>
        </Box>
      </Group>

      {/* Messages */}
      <ScrollArea style={{ flex: 1, padding: '16px' }}>
        {messages.map((msg, index) => (
          <Group
            key={index}
            justify={msg.userId === user.id ? 'flex-end' : 'flex-start'}
            mb="md"
          >
            {msg.userId !== user.id && (
              <Avatar size="sm" radius="xl" color="blue">
                {otherUser?.name?.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Paper
              shadow="sm"
              p="xs"
              radius="lg"
              style={{
                maxWidth: '70%',
                backgroundColor: msg.userId === user.id ? '#228be6' : '#f1f3f5',
                color: msg.userId === user.id ? 'white' : 'black',
              }}
            >
              <Text size="sm">{msg.text}</Text>
              <Text 
                size="xs" 
                ta="right" 
                mt={4}
                style={{ opacity: 0.7 }}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </Paper>
          </Group>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <Group p="md" style={{ borderTop: '1px solid #f0f0f0' }}>
        <ActionIcon variant="subtle" size="lg">
          <IconPhoto size={20} />
        </ActionIcon>
        <TextInput
          placeholder="Напишите сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
          radius="xl"
          size="md"
        />
        <Button 
          onClick={sendMessage}
          radius="xl"
          disabled={!newMessage.trim()}
        >
          <IconSend size={18} />
        </Button>
      </Group>
    </Box>
  )
}

export default Chat