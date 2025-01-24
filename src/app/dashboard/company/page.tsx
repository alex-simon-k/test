'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import CompanyHeader from '@/app/components/company/CompanyHeader'
import CreateProjectButton from '@/app/components/company/CreateProjectButton'
import ProjectList from '@/app/components/shared/ProjectList'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Project } from '@/lib/types'

export default function CompanyDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    console.log('CompanyDashboard useEffect running')
    console.log('User:', user?.uid)

    if (!user) {
      console.log('No user found, redirecting to home')
      router.push('/')
      return
    }

    // Fetch company's projects
    console.log('Fetching projects for user:', user.uid)
    const q = query(
      collection(db, 'projects'),
      where('companyId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Received projects snapshot')
      console.log('Number of projects:', snapshot.docs.length)
      
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Project data:', {
          id: doc.id,
          title: data.title,
          status: data.status
        })
        
        return {
          id: doc.id,
          ...data,
          status: data.status || 'open'
        } as Project
      })

      console.log('Setting projects:', projectsData.length)
      setProjects(projectsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user, router])

  // Filter projects based on status
  const activeProjects = projects.filter(project => project.status !== 'archived')
  const archivedProjects = projects.filter(project => project.status === 'archived')

  console.log('Render state:', {
    total: projects.length,
    active: activeProjects.length,
    archived: archivedProjects.length,
    showArchived
  })

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
            <p className="text-gray-600 mt-1">
              {showArchived ? 'Viewing archived projects' : 'Manage your active projects'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                console.log('Toggling archived view:', !showArchived)
                setShowArchived(!showArchived)
              }}
              className={`px-4 py-2 rounded-lg ${
                showArchived
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showArchived ? '← Back to Active Projects' : `View Archived Projects (${archivedProjects.length})`}
            </button>
            {!showArchived && <CreateProjectButton />}
          </div>
        </div>
        
        {showArchived ? (
          // Archived Projects Section
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Archived Projects</h2>
            {archivedProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Archived Projects
                </h3>
                <p className="text-gray-600">
                  You have no archived projects at the moment.
                </p>
              </div>
            ) : (
              <ProjectList projects={archivedProjects} />
            )}
          </div>
        ) : (
          // Active Projects Section
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Projects</h2>
            {activeProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Projects
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first project to start inviting interns
                </p>
                <CreateProjectButton />
              </div>
            ) : (
              <ProjectList projects={activeProjects} />
            )}
          </div>
        )}
      </main>
    </div>
  )
} 