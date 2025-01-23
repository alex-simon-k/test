'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db, storage } from '@/lib/firebase/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const StudentProfileForm = () => {
  // Student profile form implementation
  return (
    <div>
      <h2>Student Profile</h2>
      {/* Add student profile form fields */}
    </div>
  )
}

const CompanyProfileForm = () => {
  // Company profile form implementation
  return (
    <div>
      <h2>Company Profile</h2>
      {/* Add company profile form fields */}
    </div>
  )
}

export default function ProfileForm() {
  const { user } = useAuth()
  const [userType, setUserType] = useState<'student' | 'company'>('student')

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I am a:
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setUserType('student')}
            className={`px-4 py-2 rounded-lg ${
              userType === 'student'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setUserType('company')}
            className={`px-4 py-2 rounded-lg ${
              userType === 'company'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Company
          </button>
        </div>
      </div>

      {userType === 'student' ? <StudentProfileForm /> : <CompanyProfileForm />}
    </div>
  )
} 