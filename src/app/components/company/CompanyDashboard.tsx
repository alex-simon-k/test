'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Project } from '@/lib/types'
import CompanyHeader from '@/app/components/company/CompanyHeader'
import CreateProjectButton from '@/app/components/company/CreateProjectButton'
import ProjectList from '@/app/components/shared/ProjectList'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (!user) return

    console.log('=== CompanyDashboard: Starting Project Fetch ===')
    
    const q = query(
      collection(db, 'projects'),
      where('companyId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`🔍 === CompanyDashboard: Received ${snapshot.docs.length} projects ===`)
      
      const projectsData = snapshot.docs.map(doc => {
        const data = doc.data()
        const rawStatus = data.status
        
        console.log('📊 Raw Project Data:', { 
          id: doc.id, 
          title: data.title,
          rawStatus: rawStatus,
          status: data.status,
          ...data 
        })
        
        // Normalize the status value
        let normalizedStatus = String(rawStatus || '').trim().toLowerCase()
        console.log(`🔄 Project "${data.title}": Raw status "${rawStatus}" -> Normalized "${normalizedStatus}"`)
        
        if (!['open', 'closed', 'in-progress', 'archived'].includes(normalizedStatus)) {
          console.log(`⚠️ Invalid status "${normalizedStatus}" for project "${data.title}", defaulting to "open"`)
          normalizedStatus = 'open'
        }
        
        const project = {
          id: doc.id,
          ...data,
          status: normalizedStatus
        }
        
        console.log('✅ Final project data:', project)
        return project
      }) as Project[]
      
      console.log('📋 === All projects after normalization ===')
      console.table(projectsData.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status
      })))
      
      setProjects(projectsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Filter projects based on archived status
  const activeProjects = projects.filter(project => project.status !== 'archived')
  const archivedProjects = projects.filter(project => project.status === 'archived')
  
  console.log('🔎 === Filtered Projects ===')
  console.log('📁 Active projects:', activeProjects.map(p => ({ title: p.title, status: p.status })))
  console.log('🗄️ Archived projects:', archivedProjects.map(p => ({ title: p.title, status: p.status })))

  const visibleProjects = showArchived ? archivedProjects : activeProjects
  console.log('👀 Currently showing:', showArchived ? 'ARCHIVED' : 'ACTIVE', 'projects:', 
    visibleProjects.map(p => ({ title: p.title, status: p.status })))

  return (
    <div>
      <CompanyHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Projects</h1>
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
              {showArchived ? '← Back to Active Projects' : 'View Archived Projects'}
            </button>
            {!showArchived && <CreateProjectButton />}
          </div>
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
            <p className="text-gray-600 mb-4">
              {showArchived 
                ? 'You have no archived projects at the moment.'
                : 'Create your first project to start inviting interns'}
            </p>
            {!showArchived && <CreateProjectButton />}
          </div>
        ) : (
          <ProjectList projects={visibleProjects} />
        )}
      </main>
    </div>
  )
} 