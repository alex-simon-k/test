'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import ProjectCard from './ProjectCard'
import { Project } from '@/lib/types'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

export default function ProjectDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', { userId: user.uid })
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[]
      
      setProjects(projectsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Welcome to Internship Project Platform</h2>
        <p className="mb-4">Connect with companies and collaborate on real projects</p>
        <p>Please sign in to view your internship projects</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status === 'in-progress')
  const completedProjects = projects.filter(p => p.status === 'closed')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Internship Projects</h1>
        <p className="text-gray-600 mt-1">Track your progress and collaborate with your team</p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No active projects</h3>
            <p className="text-gray-600">You&apos;ll see your projects here once you&apos;re invited to one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 