import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'

interface TeamMemberProfile {
  uid: string
  name: string
  role: 'company' | 'student'
  whatsapp?: string
  email: string
  linkedin?: string
  funFacts?: string
  introduction?: string
  profileCompleted: boolean
}

interface TeamProfilesProps {
  projectId: string
  members: Record<string, any>
  companyId: string
}

export default function TeamProfiles({ projectId, members, companyId }: TeamProfilesProps) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<TeamMemberProfile[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<TeamMemberProfile | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [projectId, members, companyId])

  const fetchProfiles = async () => {
    try {
      const profilePromises = [
        // Fetch company profile
        getDoc(doc(db, 'users', companyId)),
        // Fetch student profiles
        ...Object.keys(members)
          .filter(uid => uid !== companyId)
          .map(uid => getDoc(doc(db, 'users', uid)))
      ]

      const profileDocs = await Promise.all(profilePromises)
      const fetchedProfiles: TeamMemberProfile[] = profileDocs.map(doc => {
        const data = doc.data()
        return {
          uid: doc.id,
          name: data?.name || 'Anonymous',
          role: doc.id === companyId ? 'company' as const : 'student' as const,
          whatsapp: data?.whatsapp || '',
          email: data?.email || '',
          linkedin: data?.linkedin || '',
          funFacts: data?.funFacts || '',
          introduction: data?.introduction || '',
          profileCompleted: !!data?.profileCompleted
        }
      })

      setProfiles(fetchedProfiles)
      
      // Set current user's profile for editing
      const userProfile = fetchedProfiles.find(p => p.uid === user?.uid)
      if (userProfile) {
        setCurrentProfile(userProfile)
      }
    } catch (error) {
      console.error('Error fetching team profiles:', error)
    }
  }

  const handleProfileUpdate = async (updatedProfile: Partial<TeamMemberProfile>) => {
    if (!user?.uid) return

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        ...updatedProfile,
        profileCompleted: true,
        updatedAt: new Date()
      })

      setEditMode(false)
      fetchProfiles() // Refresh profiles
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        {currentProfile && !currentProfile.profileCompleted && (
          <div className="text-amber-600">
            Please complete your profile
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      {editMode && currentProfile && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Edit Your Profile</h3>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleProfileUpdate({
              name: formData.get('name') as string,
              whatsapp: formData.get('whatsapp') as string,
              linkedin: formData.get('linkedin') as string,
              introduction: formData.get('introduction') as string,
              funFacts: formData.get('funFacts') as string,
            })
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={currentProfile.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WhatsApp (optional)</label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={currentProfile.whatsapp}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Profile (optional)</label>
              <input
                type="url"
                name="linkedin"
                defaultValue={currentProfile.linkedin}
                placeholder="https://www.linkedin.com/in/your-profile"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Introduction</label>
              <textarea
                name="introduction"
                defaultValue={currentProfile.introduction}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fun Facts (optional)</label>
              <textarea
                name="funFacts"
                defaultValue={currentProfile.funFacts}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div key={profile.uid} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              </div>
              {user?.uid === profile.uid && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
              )}
            </div>
            
            {profile.profileCompleted ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">{profile.introduction}</p>
                </div>
                {profile.funFacts && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Fun Facts</h4>
                    <p className="text-gray-600">{profile.funFacts}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Email: </span>
                    <a href={`mailto:${profile.email}`} className="text-blue-500 hover:text-blue-600">
                      {profile.email}
                    </a>
                  </p>
                  {profile.whatsapp && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">WhatsApp: </span>
                      <span className="text-gray-600">{profile.whatsapp}</span>
                    </p>
                  )}
                  {profile.linkedin && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">LinkedIn: </span>
                      <a 
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        View Profile
                      </a>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">Profile not yet completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 