'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProjectHeaderProps {
  project: {
    title: string
    companyName?: string
    companyLogo?: string
  }
  isCompanyOwner: boolean
}

export default function ProjectHeader({ project, isCompanyOwner }: ProjectHeaderProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleBack = () => {
    if (isCompanyOwner) {
      router.push('/dashboard/company')
    } else {
      router.push('/dashboard/student')
    }
  }

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            {project.companyLogo ? (
              <Image
                src={project.companyLogo}
                alt={project.companyName || 'Company Logo'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {project.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
              {project.companyName && (
                <p className="text-sm text-gray-500">{project.companyName}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 