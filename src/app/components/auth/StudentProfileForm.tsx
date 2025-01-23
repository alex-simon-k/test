'use client'

import { useState } from 'react'
import { StudentProfile } from '@/lib/types'

interface StudentProfileFormProps {
  onSubmit: (data: StudentProfile) => Promise<void>
}

export default function StudentProfileForm({ onSubmit }: StudentProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<StudentProfile>({
    university: '',
    major: '',
    graduationYear: '',
    skills: [],
    bio: '',
    linkedIn: '',
    github: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Complete Your Student Profile</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">University</label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Major</label>
        <input
          type="text"
          value={formData.major}
          onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Graduation Year</label>
        <input
          type="text"
          value={formData.graduationYear}
          onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
        <input
          type="text"
          value={formData.skills.join(', ')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="React, TypeScript, Node.js"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
        <input
          type="url"
          value={formData.linkedIn}
          onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://linkedin.com/in/username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">GitHub Profile</label>
        <input
          type="url"
          value={formData.github}
          onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://github.com/username"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  )
} 