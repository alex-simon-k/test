'use client'

import { useState } from 'react'
import { CompanyProfile } from '@/lib/types'

interface CompanyProfileFormProps {
  onSubmit: (data: CompanyProfile) => Promise<void>
}

export default function CompanyProfileForm({ onSubmit }: CompanyProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CompanyProfile>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    location: ''
  })
  const [logo, setLogo] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit({
        ...formData,
        logo: logo || undefined
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Complete Company Profile</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Company Name</label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Industry</label>
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company Size</label>
        <select
          value={formData.companySize}
          onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
        >
          <option value="">Select size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501+">501+ employees</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company Website</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://company.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
          required
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