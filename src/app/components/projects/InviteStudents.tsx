'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, getDocs, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'

interface InviteStudentsProps {
  projectId: string
}

interface StudentResult {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  profile?: {
    university?: string
    major?: string
  }
  invited?: boolean
}

export default function InviteStudents({ projectId }: InviteStudentsProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<StudentResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearch = async () => {
    if (!searchTerm) return
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      // First check if project exists and get its details
      const projectRef = doc(db, 'projects', projectId)
      const projectSnap = await getDoc(projectRef)
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found')
      }

      const projectData = projectSnap.data()
      
      // Query for students
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'student'),
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
      )

      const querySnapshot = await getDocs(q)
      const results = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const userData = doc.data()
        
        // Check if student is already invited
        const isInvited = projectData.invitedStudents?.[doc.id] !== undefined
        
        return {
          id: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          profile: userData.profile,
          invited: isInvited
        }
      }))

      setSearchResults(results)
      
      if (results.length === 0) {
        setError('No students found with that email')
      }
    } catch (error) {
      console.error('Error searching students:', error)
      setError('Failed to search for students. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (student: StudentResult) => {
    if (!user) return
    
    setError('')
    setSuccessMessage('')
    setIsLoading(true)
    console.log('Inviting student:', student.id) // Debug log

    try {
      // Add student to project's invited list with explicit status
      const projectRef = doc(db, 'projects', projectId)
      const inviteData = {
        status: 'pending',
        invitedAt: new Date(),
        invitedBy: user.uid
      }
      console.log('Setting invitation data:', inviteData) // Debug log

      await updateDoc(projectRef, {
        [`invitedStudents.${student.id}`]: inviteData
      })

      // Log the project data after update
      const updatedProject = await getDoc(projectRef)
      console.log('Updated project data:', updatedProject.data()) // Debug log

      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        type: 'project_invitation',
        projectId,
        recipientId: student.id,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        createdAt: new Date(),
        status: 'unread',
        message: `You have been invited to join a project by ${user.displayName || user.email}`
      })

      // Update search results to show invited status
      setSearchResults(prev =>
        prev.map(s =>
          s.id === student.id
            ? { ...s, invited: true }
            : s
        )
      )

      console.log('Successfully invited student:', student.id) // Debug log
      setSuccessMessage(`Successfully invited ${student.email}`)
    } catch (error) {
      console.error('Error inviting student:', error)
      setError('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">Invite Students</h3>
        <p className="text-sm text-gray-600">Search for students by email to invite them to your project.</p>
      </div>

      <div className="flex gap-4">
        <input
          type="email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter student email"
          className="flex-1 px-4 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchTerm}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {student.photoURL ? (
                  <Image
                    src={student.photoURL}
                    alt={student.displayName || student.email}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {(student.displayName || student.email)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {student.displayName || student.email}
                  </p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  {student.profile?.university && (
                    <p className="text-sm text-gray-500">
                      {student.profile.university} • {student.profile.major}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleInvite(student)}
                disabled={student.invited || isLoading}
                className={`px-4 py-2 rounded-lg ${
                  student.invited
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {student.invited ? 'Invited' : 'Invite'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 