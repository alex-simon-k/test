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

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // Fetch company's projects
    const q = query(
      collection(db, 'projects'),
      where('companyId', '==', user.uid)
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
  }, [user, router])

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
          <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
          <CreateProjectButton />
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first internship project to get started</p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </main>
    </div>
  )
} 