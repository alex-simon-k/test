'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import ProjectInvitations from '@/app/components/student/ProjectInvitations'
import MyProjects from '@/app/components/student/MyProjects'
import StudentHeader from '@/app/components/student/StudentHeader'

export default function StudentDashboard() {
  console.log('=== StudentDashboard MOUNTING ===')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      console.log('=== StudentDashboard Init ===')
      console.log('Current user:', user?.email)
      
      if (!user) {
        console.log('No user found, redirecting to home')
        router.push('/')
      } else {
        console.log('User authenticated:', {
          uid: user.uid,
          email: user.email
        })
      }
    }

    init()
  }, [user, router])

  if (!user) {
    console.log('=== StudentDashboard: No user, returning null ===')
    return null
  }

  console.log('=== StudentDashboard: Rendering with user ===', user.email)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Show Project Invitations */}
        <ProjectInvitations />

        {/* Show Active Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">My Projects</h2>
          <MyProjects />
        </div>
      </main>
    </div>
  )
} 