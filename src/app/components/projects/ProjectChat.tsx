'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, orderBy, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  createdAt: any
}

interface ProjectChatProps {
  projectId: string
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId) return

    const q = query(
      collection(db, 'messages'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(messagesData)
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [projectId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    setIsLoading(true)
    try {
      await addDoc(collection(db, 'messages'), {
        projectId,
        content: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderAvatar: user.photoURL,
        createdAt: serverTimestamp()
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.senderId === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {message.senderAvatar ? (
              <Image
                src={message.senderAvatar}
                alt={message.senderName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm">{message.senderName[0]}</span>
              </div>
            )}
            
            <div className={`flex flex-col ${
              message.senderId === user?.uid ? 'items-end' : ''
            }`}>
              <span className="text-xs text-gray-500">{message.senderName}</span>
              <div className={`mt-1 px-4 py-2 rounded-lg ${
                message.senderId === user?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
} 