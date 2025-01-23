'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter, useParams } from 'next/navigation'
import ProjectHeader from '@/app/components/projects/ProjectHeader'
import TaskBoard from '@/app/components/projects/TaskBoard'
import ProjectChat from '@/app/components/projects/ProjectChat'
import InviteStudents from '@/app/components/projects/InviteStudents'

export default function ProjectDetails() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [isCompanyOwner, setIsCompanyOwner] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'chat'>('overview')
  const [userRole, setUserRole] = useState<'company' | 'student' | null>(null)
  
  // Get projectId from params
  const projectId = params?.projectId as string

  useEffect(() => {
    console.log('=== ProjectDetails useEffect running ===')
    console.log('Current user:', user?.uid)
    console.log('Project ID:', projectId)

    if (!user || !projectId) {
      console.log('No user or projectId found, redirecting to home')
      router.push('/')
      return
    }

    const fetchProject = async () => {
      try {
        console.log('Fetching project with ID:', projectId)
        const projectRef = doc(db, 'projects', projectId)
        const projectSnap = await getDoc(projectRef)
        
        if (!projectSnap.exists()) {
          console.log('Project not found')
          router.push('/dashboard/student')
          return
        }

        const projectData = projectSnap.data()
        console.log('Project data:', projectData)
        console.log('Company ID from project:', projectData.companyId)
        console.log('Current user ID:', user.uid)
        console.log('Project status:', projectData.status)
        console.log('Project members:', projectData.members)
        
        setProject(projectData)
        
        // Check if user is company owner
        const isOwner = projectData.companyId === user.uid
        console.log('Is company owner?', isOwner)
        setIsCompanyOwner(isOwner)
        
        // Determine user role
        if (isOwner) {
          console.log('Setting user role to company')
          setUserRole('company')
        } else if (projectData.members && typeof projectData.members === 'object' && projectData.members[user.uid]) {
          console.log('Setting user role to student')
          setUserRole('student')
        } else {
          console.log('Setting user role to null - user not found in members')
          setUserRole(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching project:', error)
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId, user, router])

  const handleArchiveProject = async () => {
    if (!project || !user) return

    if (!window.confirm('Are you sure you want to archive this project? This will hide it from the main dashboard.')) {
      return
    }

    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        status: 'archived',
        updatedAt: new Date()
      })

      router.push('/dashboard/company')
    } catch (error) {
      console.error('Error archiving project:', error)
      alert('Failed to archive project. Please try again.')
    }
  }

  const handleUnarchiveProject = async () => {
    if (!project || !user) return

    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        status: 'in-progress',
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error unarchiving project:', error)
      alert('Failed to unarchive project. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
          <p className="text-gray-600 mt-2">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        </div>
      </div>
    )
  }

  console.log('Rendering project details:')
  console.log('- isCompanyOwner:', isCompanyOwner)
  console.log('- Project status:', project?.status)
  console.log('- User role:', userRole)

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader project={project} isCompanyOwner={isCompanyOwner} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'tasks'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'chat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Chat
            </button>
          </div>
          
          {userRole === 'company' && (
            <div className="flex space-x-4">
              {project.status === 'archived' ? (
                <button
                  onClick={handleUnarchiveProject}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Unarchive Project
                </button>
              ) : (
                <button
                  onClick={handleArchiveProject}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Archive Project
                </button>
              )}
              {project.status !== 'archived' && <InviteStudents projectId={projectId} />}
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h2>
            <p className="text-gray-600 mb-6">{project.description}</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-600">{project.requirements}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><span className="font-medium">Duration:</span> {project.duration}</li>
                  <li><span className="font-medium">Type:</span> {project.type}</li>
                  <li>
                    <span className="font-medium">Skills:</span>{' '}
                    {Array.isArray(project.skills) ? project.skills.join(', ') : project.skills}
                  </li>
                  <li>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`capitalize ${
                      project.status === 'active' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {project.status}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskBoard 
            projectId={projectId} 
            isCompanyOwner={isCompanyOwner}
            userRole={userRole}
          />
        )}

        {activeTab === 'chat' && (
          <ProjectChat projectId={projectId} />
        )}
      </div>
    </div>
  )
} 