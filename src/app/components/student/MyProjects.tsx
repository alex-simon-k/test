'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, getDocs, where } from 'firebase/firestore'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  description: string
  status: string
}

export default function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const projectsRef = collection(db, 'projects')
        const querySnapshot = await getDocs(projectsRef)
        
        const userProjects: Project[] = []
        
        querySnapshot.forEach((doc) => {
          const projectData = doc.data()
          // Check if user is a member of this project
          if (projectData.members && projectData.members[user.uid]) {
            userProjects.push({
              id: doc.id,
              title: projectData.title || 'Untitled Project',
              companyName: projectData.companyName || 'Unknown Company',
              companyLogo: projectData.companyLogo,
              description: projectData.description || 'No description available',
              status: projectData.members[user.uid].status || 'active'
            })
          }
        })

        setProjects(userProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load your projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven&apos;t joined any projects yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link 
          href={`/projects/${project.id}`}
          key={project.id}
          className="block bg-white rounded-lg shadow-sm p-6 hover:shadow transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {project.companyLogo ? (
                <Image
                  src={project.companyLogo}
                  alt={project.companyName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {project.companyName[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.companyName}</p>
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
          <p className="mt-4 text-gray-600 text-sm line-clamp-2">{project.description}</p>
        </Link>
      ))}
    </div>
  )
} 