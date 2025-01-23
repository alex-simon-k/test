'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, getDocs, updateDoc, doc, getDoc, deleteDoc, addDoc, Timestamp, deleteField } from 'firebase/firestore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ProjectInvitation {
  projectId: string
  projectTitle: string
  companyName: string
  companyLogo?: string
  invitedAt: Date
  status: 'pending' | 'accepted' | 'declined'
}

export default function ProjectInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchInvitations = async () => {
      setIsLoading(true)
      try {
        const projectsRef = collection(db, 'projects')
        const querySnapshot = await getDocs(projectsRef)
        const results: ProjectInvitation[] = []

        for (const doc of querySnapshot.docs) {
          const projectData = doc.data()
          if (projectData.invitedStudents && projectData.invitedStudents[user.uid]) {
            const invitation = projectData.invitedStudents[user.uid]
            let invitedAtDate: Date
            try {
              if (invitation.invitedAt instanceof Timestamp) {
                invitedAtDate = invitation.invitedAt.toDate()
              } else if (invitation.invitedAt?.toDate) {
                invitedAtDate = invitation.invitedAt.toDate()
              } else if (invitation.invitedAt instanceof Date) {
                invitedAtDate = invitation.invitedAt
              } else {
                invitedAtDate = new Date(invitation.invitedAt)
              }
            } catch (error) {
              invitedAtDate = new Date()
            }

            if (invitation.status === 'pending') {
              results.push({
                projectId: doc.id,
                projectTitle: projectData.title || 'Untitled Project',
                companyName: projectData.companyName || 'Unknown Company',
                companyLogo: projectData.companyLogo,
                invitedAt: invitedAtDate,
                status: invitation.status
              })
            }
          }
        }

        setInvitations(results)
      } catch (error) {
        console.error('Error fetching invitations:', error)
        setError('Failed to load invitations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [user])

  const handleInvitation = async (projectId: string, action: 'accept' | 'decline') => {
    if (!user) return

    try {
      const projectRef = doc(db, 'projects', projectId)
      const projectSnap = await getDoc(projectRef)
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found')
      }

      if (action === 'accept') {
        await updateDoc(projectRef, {
          [`members.${user.uid}`]: {
            role: 'intern',
            joinedAt: new Date(),
            status: 'active',
            name: user.displayName || user.email,
            email: user.email,
            avatar: user.photoURL
          },
          [`invitedStudents.${user.uid}`]: deleteField()
        })

        await addDoc(collection(db, 'notifications'), {
          type: 'invitation_accepted',
          projectId,
          recipientId: projectSnap.data().companyId,
          senderId: user.uid,
          senderName: user.displayName || user.email,
          createdAt: new Date(),
          status: 'unread',
          message: `${user.displayName || user.email} has accepted your project invitation`
        })

        router.push(`/projects/${projectId}`)
      } else {
        await updateDoc(projectRef, {
          [`invitedStudents.${user.uid}`]: deleteField()
        })
      }

      setInvitations(prev => prev.filter(inv => inv.projectId !== projectId))
    } catch (error) {
      console.error('Error handling invitation:', error)
      setError(`Failed to ${action} invitation`)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Project Invitations</h2>
        <p className="text-sm text-gray-600">
          {invitations.length > 0
            ? `You have ${invitations.length} pending project invitation${invitations.length === 1 ? '' : 's'}`
            : 'You have no pending project invitations'}
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.projectId}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {invitation.companyLogo ? (
                <Image
                  src={invitation.companyLogo}
                  alt={invitation.companyName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {invitation.companyName[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{invitation.projectTitle}</h3>
                <p className="text-sm text-gray-600">{invitation.companyName}</p>
                <p className="text-xs text-gray-500">
                  Invited {invitation.invitedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleInvitation(invitation.projectId, 'decline')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => handleInvitation(invitation.projectId, 'accept')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 