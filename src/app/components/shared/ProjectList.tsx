'use client'

import { Project } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { doc, updateDoc } from 'firebase/firestore'

interface ProjectListProps {
  projects: Project[]
}

export default function ProjectList({ projects }: ProjectListProps) {
  const { user } = useAuth()

  const handleArchiveProject = async (projectId: string, currentStatus: string) => {
    if (!user) return
    
    const newStatus = currentStatus === 'archived' ? 'in-progress' : 'archived'
    const message = currentStatus === 'archived' 
      ? 'Are you sure you want to unarchive this project?' 
      : 'Are you sure you want to archive this project? This will hide it from the main dashboard.'
    
    if (!window.confirm(message)) return

    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating project status:', error)
      alert('Failed to update project status. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {project.companyLogo ? (
                <Image
                  src={project.companyLogo}
                  alt={project.companyName || 'Company Logo'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {(project.companyName || 'C')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.companyName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Details
              </Link>
              {project.companyId === user?.uid && (
                <button
                  onClick={() => handleArchiveProject(project.id, project.status)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    project.status === 'archived'
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 line-clamp-2">{project.description}</p>
          </div>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Status:</span>
              <span className={`capitalize ${
                project.status === 'archived' ? 'text-gray-500' :
                project.status === 'in-progress' ? 'text-blue-600' :
                project.status === 'closed' ? 'text-red-600' :
                'text-green-600'
              }`}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Type:</span>
              <span className="text-gray-900">{project.type}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Duration:</span>
              <span className="text-gray-900">{project.duration}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}