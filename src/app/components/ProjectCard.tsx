import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
        <div className="flex items-center mb-4">
          {project.companyLogo ? (
            <Image
              src={project.companyLogo}
              alt={project.companyName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-500">
                {project.companyName[0]}
              </span>
            </div>
          )}
          <div className="ml-3">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-sm text-gray-600">{project.companyName}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className={`px-2 py-1 rounded-full ${
            project.status === 'in-progress' ? 'bg-green-100 text-green-800' :
            project.status === 'closed' ? 'bg-blue-100 text-blue-800' :
            project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status === 'in-progress' ? 'Active' :
             project.status === 'closed' ? 'Completed' :
             project.status === 'archived' ? 'Archived' :
             'Open'}
          </span>
          <span className="text-gray-500">
            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Start date TBD'}
          </span>
        </div>
      </div>
    </Link>
  )
} 