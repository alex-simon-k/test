'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Project } from '@/lib/types'
import StudentHeader from '@/app/components/student/StudentHeader'
import ProjectList from '@/app/components/shared/ProjectList'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]
      
      setProjects(projectsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const visibleProjects = projects.filter(project => 
    showArchived ? project.status === 'archived' : project.status !== 'archived'
  )

  return (
    <div>
      <StudentHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Internship Projects</h1>
            <p className="text-gray-600 mt-1">View and manage your assigned projects</p>
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg ${
              showArchived
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No Archived Projects' : 'No Active Projects'}
            </h3>
            <p className="text-gray-600">
              {showArchived 
                ? 'You have no archived projects at the moment.'
                : 'You haven\'t been assigned to any projects yet. You\'ll see your projects here once a company invites you.'}
            </p>
          </div>
        ) : (
          <ProjectList projects={visibleProjects} />
        )}
      </main>
    </div>
  )
} 